import { useRef, useCallback } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { useSceneStore, type Asset } from '../store/useSceneStore';
import Konva from 'konva';

export const useCanvasEvents = (stageRef: React.RefObject<Konva.Stage | null>) => {
  const activeTool = useEditorStore((state) => state.activeTool);
  const setTool = useEditorStore((state) => state.setTool);
  const editingTextId = useEditorStore((state) => state.editingTextId);
  const setEditingTextId = useEditorStore((state) => state.setEditingTextId);
  const addAsset = useSceneStore((state) => state.addAsset);
  const updateAsset = useSceneStore((state) => state.updateAsset);
  const selectAssets = useSceneStore((state) => state.selectAssets);

  const isDrawing = useRef(false);
  const currentAssetId = useRef<string | null>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const getRelativePointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const pointer = stage.getPointerPosition();
    if (!pointer) return { x: 0, y: 0 };
    
    return {
      x: (pointer.x - stage.x()) / stage.scaleX(),
      y: (pointer.y - stage.y()) / stage.scaleY()
    };
  }, [stageRef]);

  const handleMouseDown = useCallback(() => {
    if (editingTextId) return;
    if (activeTool === 'cursor' || activeTool === 'pan') return;

    const pos = getRelativePointerPosition();
    isDrawing.current = true;
    startPos.current = pos;

    if (['rect', 'circle', 'text', 'frame'].includes(activeTool)) {
      const id = crypto.randomUUID();
      currentAssetId.current = id;
      
      const newAsset: Asset = {
        id,
        type: (activeTool === 'rect' || activeTool === 'circle' || activeTool === 'text' || activeTool === 'frame') ? (activeTool as any) : 'rect',
        x: pos.x,
        y: pos.y,
        width: 5,
        height: 5,
        rotation: 0,
        name: `${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}`,
        visible: true,
        locked: false,
        parentId: null,
        properties: {
          fill: activeTool === 'text' ? '#FFFFFF' : (activeTool === 'frame' ? '#FFFFFF10' : '#333333'),
          stroke: activeTool === 'frame' ? '#FFFFFF20' : '#0095FF',
          strokeWidth: activeTool === 'frame' ? 1 : 2,
          opacity: 100,
          clipContent: activeTool === 'frame' ? true : undefined,
          text: activeTool === 'text' ? 'Type something...' : undefined,
          fontSize: activeTool === 'text' ? 24 : undefined,
          fontFamily: activeTool === 'text' ? 'Inter, sans-serif' : undefined,
        }
      };
      
      addAsset(newAsset);
      selectAssets([id]);

      // If text tool, immediately start editing on mouse up OR dbl click logic
      // For Figma style, single click with text tool creates and starts editing
    }
  }, [activeTool, editingTextId, addAsset, selectAssets, getRelativePointerPosition]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current || !currentAssetId.current) return;

    const pos = getRelativePointerPosition();
    let dx = pos.x - startPos.current.x;
    let dy = pos.y - startPos.current.y;

    // Shift + Draw: Proportional (1:1)
    if (e.evt && e.evt.shiftKey && activeTool !== 'text') {
      const size = Math.max(Math.abs(dx), Math.abs(dy));
      dx = dx > 0 ? size : -size;
      dy = dy > 0 ? size : -size;
    }

    if (['rect', 'circle', 'frame'].includes(activeTool)) {
      updateAsset(currentAssetId.current, {
        x: dx > 0 ? startPos.current.x : startPos.current.x + dx,
        y: dy > 0 ? startPos.current.y : startPos.current.y + dy,
        width: Math.max(5, Math.abs(dx)),
        height: Math.max(5, Math.abs(dy)),
      });
    }
  }, [activeTool, updateAsset, getRelativePointerPosition]);

  const handleMouseUp = useCallback(() => {
    if (activeTool === 'text' && currentAssetId.current) {
      setEditingTextId(currentAssetId.current);
    }
    
    // Auto-switch back to cursor if we drawn something
    if (['rect', 'circle', 'text', 'frame'].includes(activeTool) && currentAssetId.current) {
      setTool('cursor');
    }

    isDrawing.current = false;
    currentAssetId.current = null;
  }, [activeTool, setEditingTextId, setTool]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
