import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Ellipse, Text, Transformer } from 'react-konva';
import Konva from 'konva';
import { useSceneStore, type Asset } from '../../store/useSceneStore';
import { useEditorStore } from '../../store/useEditorStore';
import { useCanvasEvents } from '../../hooks/useCanvasEvents';

const AssetComponent: React.FC<{ asset: Asset }> = ({ asset }) => {
  const updateAsset = useSceneStore((state) => state.updateAsset);

  const commonProps = {
    id: asset.id,
    name: 'selectable', 
    x: asset.x,
    y: asset.y,
    width: asset.width,
    height: asset.height,
    rotation: asset.rotation,
    draggable: !asset.locked,
    visible: asset.visible,
    opacity: (asset.properties.opacity ?? 100) / 100,
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
          fill={asset.properties.fill}
          fontFamily="Inter, sans-serif"
        />
      );
    default:
      return null;
  }
};

const KonvaRenderer: React.FC = () => {
  const assets = useSceneStore((state) => state.assets);
  const selectedIds = useSceneStore((state) => state.selectedIds);
  const selectAssets = useSceneStore((state) => state.selectAssets);
  const zoom = useEditorStore((state) => state.zoom);
  const panning = useEditorStore((state) => state.panning);
  const setPanning = useEditorStore((state) => state.setPanning);
  const activeTool = useEditorStore((state) => state.activeTool);

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const { handleMouseDown: onDrawingStart, handleMouseMove, handleMouseUp: onDrawingEnd } = useCanvasEvents(stageRef);

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

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    onDrawingStart(e);

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

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      ref={stageRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={onDrawingEnd}
      scaleX={zoom}
      scaleY={zoom}
      x={panning.x}
      y={panning.y}
      draggable={activeTool === 'pan'}
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
        {selectedIds.length > 0 && (
          <Transformer
            ref={transformerRef}
            rotateEnabled={activeTool === 'cursor'}
            resizeEnabled={activeTool === 'cursor'}
            anchorSize={8}
            anchorCornerRadius={2}
            anchorStroke="#0095FF"
            borderStroke="#0095FF"
            anchorFill="white"
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
