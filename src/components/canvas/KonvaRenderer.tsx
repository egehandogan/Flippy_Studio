import React, { useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Ellipse, Text, Transformer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import { useSceneStore, type Asset } from '../../store/useSceneStore';
import { useEditorStore } from '../../store/useEditorStore';
import { useCanvasEvents } from '../../hooks/useCanvasEvents';

// Component to render Image assets using Konva.Image
const ImageAsset: React.FC<{ asset: Asset; commonProps: Record<string, unknown> }> = ({ asset, commonProps }) => {
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (asset.properties.src) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = asset.properties.src;
      img.onload = () => setImage(img);
    }
  }, [asset.properties.src]);

  if (!image) return null;
  return <KonvaImage {...commonProps} image={image} />;
};

const AssetComponent: React.FC<{ asset: Asset }> = ({ asset }) => {
  const updateAsset = useSceneStore((state) => state.updateAsset);
  const editingTextId = useEditorStore((state) => state.editingTextId);
  const setEditingTextId = useEditorStore((state) => state.setEditingTextId);
  const activeTool = useEditorStore((state) => state.activeTool);
  
  const dragStartPos = useRef({ x: 0, y: 0 });

  const commonProps = {
    id: asset.id,
    name: 'selectable', 
    x: asset.x,
    y: asset.y,
    width: asset.width,
    height: asset.height,
    rotation: asset.rotation,
    draggable: !asset.locked && editingTextId !== asset.id,
    visible: asset.visible && editingTextId !== asset.id,
    opacity: (asset.properties.opacity ?? 100) / 100,
    onDragStart: (e: Konva.KonvaEventObject<DragEvent>) => {
      dragStartPos.current = { x: e.target.x(), y: e.target.y() };
    },
    onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => {
      if (e.evt && e.evt.shiftKey) {
        const dx = Math.abs(e.target.x() - dragStartPos.current.x);
        const dy = Math.abs(e.target.y() - dragStartPos.current.y);
        if (dx > dy) e.target.y(dragStartPos.current.y);
        else e.target.x(dragStartPos.current.x);
      }
    },
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      updateAsset(asset.id, { x: e.target.x(), y: e.target.y() });
    },
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target;
      updateAsset(asset.id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * node.scaleX()),
        height: Math.max(5, node.height() * node.scaleY()),
        rotation: node.rotation(),
      });
      node.scaleX(1);
      node.scaleY(1);
    },
    onDblClick: () => {
      if (asset.type === 'text') setEditingTextId(asset.id);
    },
    onClick: () => {
      if (activeTool === 'text' && asset.type === 'text') setEditingTextId(asset.id);
    }
  };

  switch (asset.type) {
    case 'rect':
      return (
        <Rect
          {...commonProps}
          fill={asset.properties.fill}
          stroke={asset.properties.stroke}
          strokeWidth={asset.properties.strokeWidth}
          cornerRadius={asset.properties.cornerRadius}
        />
      );
    case 'circle':
      return (
        <Ellipse
          {...commonProps}
          fill={asset.properties.fill}
          stroke={asset.properties.stroke}
          strokeWidth={asset.properties.strokeWidth}
          radiusX={asset.width / 2}
          radiusY={asset.height / 2}
          offsetX={-asset.width / 2}
          offsetY={-asset.height / 2}
        />
      );
    case 'text':
      return (
        <Text
          {...commonProps}
          text={asset.properties.text || 'Type...'}
          fontSize={asset.properties.fontSize || 16}
          fontFamily={asset.properties.fontFamily || 'Inter, sans-serif'}
          fontWeight={asset.properties.fontWeight as string || 'normal'}
          fill={asset.properties.fill}
          align={asset.properties.textAlign as string || 'left'}
          lineHeight={asset.properties.lineHeight || 1.2}
        />
      );
    case 'image':
      return <ImageAsset asset={asset} commonProps={commonProps} />;
    default:
      return null;
  }
};

const KonvaRenderer: React.FC = () => {
  const assets = useSceneStore((state) => state.assets);
  const selectedIds = useSceneStore((state) => state.selectedIds);
  const selectAssets = useSceneStore((state) => state.selectAssets);
  const zoom = useEditorStore((state) => state.zoom);
  const setZoom = useEditorStore((state) => state.setZoom);
  const panning = useEditorStore((state) => state.panning);
  const setPanning = useEditorStore((state) => state.setPanning);
  const activeTool = useEditorStore((state) => state.activeTool);
  const editingTextId = useEditorStore((state) => state.editingTextId);

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const isMiddleMousePanning = useRef(false);
  const lastPointerPos = useRef({ x: 0, y: 0 });

  const { handleMouseDown: onDrawingStart, handleMouseMove: onDrawingMove, handleMouseUp: onDrawingEnd } = useCanvasEvents(stageRef);

  useEffect(() => {
    if (transformerRef.current) {
      const stage = transformerRef.current.getStage();
      if (!stage) return;
      const nodes = selectedIds
        .map((id) => stage.findOne('#' + id))
        .filter((node): node is Konva.Node => node !== undefined);
      transformerRef.current.nodes(nodes);
    }
  }, [selectedIds, assets]);

  // ── Scroll to Zoom ──
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const oldScale = zoom;
    const scaleBy = 1.08;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.05, Math.min(20, newScale));

    // Zoom toward pointer position
    const mousePointTo = {
      x: (pointer.x - panning.x) / oldScale,
      y: (pointer.y - panning.y) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    setZoom(clampedScale);
    setPanning(newPos);
  }, [zoom, panning, setZoom, setPanning]);

  // ── Middle Mouse Panning ──
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Middle mouse button (button === 1)
    if (e.evt.button === 1) {
      e.evt.preventDefault();
      isMiddleMousePanning.current = true;
      lastPointerPos.current = { x: e.evt.clientX, y: e.evt.clientY };
      return;
    }

    if (editingTextId) return;
    onDrawingStart();

    if (activeTool !== 'cursor' && activeTool !== 'pan') return;

    if (e.target === e.target.getStage()) {
      selectAssets([]);
      return;
    }

    const id = e.target.id();
    if (activeTool === 'cursor' && id) {
      selectAssets([id]);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isMiddleMousePanning.current) {
      const dx = e.evt.clientX - lastPointerPos.current.x;
      const dy = e.evt.clientY - lastPointerPos.current.y;
      lastPointerPos.current = { x: e.evt.clientX, y: e.evt.clientY };
      setPanning({ x: panning.x + dx, y: panning.y + dy });
      return;
    }
    onDrawingMove(e);
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button === 1 || isMiddleMousePanning.current) {
      isMiddleMousePanning.current = false;
      return;
    }
    onDrawingEnd();
  };

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      ref={stageRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      scaleX={zoom}
      scaleY={zoom}
      x={panning.x}
      y={panning.y}
      draggable={activeTool === 'pan' && !editingTextId}
      onDragEnd={(e) => {
        if (activeTool === 'pan') {
          setPanning({ x: e.target.x(), y: e.target.y() });
        }
      }}
      className="bg-[#0A0A0A]"
    >
      <Layer>
        {assets.map((asset) => (
          <AssetComponent key={asset.id} asset={asset} />
        ))}
        {selectedIds.length > 0 && activeTool === 'cursor' && (
          <Transformer
            ref={transformerRef}
            rotateEnabled={true}
            resizeEnabled={true}
            anchorSize={8}
            anchorCornerRadius={2}
            anchorStroke="#0095FF"
            borderStroke="#0095FF"
            anchorFill="white"
            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
            rotateAnchorOffset={20}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) return oldBox;
              return newBox;
            }}
          />
        )}
      </Layer>
    </Stage>
  );
};

export default KonvaRenderer;
