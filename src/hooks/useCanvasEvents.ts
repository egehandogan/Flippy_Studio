import { useRef, useCallback } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { useSceneStore, type Asset } from '../store/useSceneStore';
import Konva from 'konva';

export const useCanvasEvents = (stageRef: React.RefObject<Konva.Stage | null>) => {
  const activeTool = useEditorStore((state) => state.activeTool);
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
    if (activeTool === 'cursor' || activeTool === 'pan') return;

    const pos = getRelativePointerPosition();
    isDrawing.current = true;
    startPos.current = pos;

    if (['rect', 'circle', 'text'].includes(activeTool)) {
      const id = crypto.randomUUID();
      currentAssetId.current = id;
      
      const newAsset: Asset = {
        id,
        type: (activeTool === 'rect' || activeTool === 'circle' || activeTool === 'text') ? activeTool : 'rect',
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
          fill: '#FFFFFF',
          stroke: '#0095FF',
          strokeWidth: 2,
          opacity: 100,
          text: activeTool === 'text' ? 'Type something...' : undefined,
          fontSize: activeTool === 'text' ? 24 : undefined,
        }
      };
      
      addAsset(newAsset);
      selectAssets([id]);
    }
  }, [activeTool, addAsset, selectAssets, getRelativePointerPosition]);

  const handleMouseMove = useCallback(() => {
    if (!isDrawing.current || !currentAssetId.current) return;

    const pos = getRelativePointerPosition();
    const dx = pos.x - startPos.current.x;
    const dy = pos.y - startPos.current.y;

    if (['rect', 'circle'].includes(activeTool)) {
      updateAsset(currentAssetId.current, {
        x: dx > 0 ? startPos.current.x : pos.x,
        y: dy > 0 ? startPos.current.y : pos.y,
        width: Math.max(5, Math.abs(dx)),
        height: Math.max(5, Math.abs(dy)),
      });
    }
  }, [activeTool, updateAsset, getRelativePointerPosition]);

  const handleMouseUp = useCallback(() => {
    isDrawing.current = false;
    currentAssetId.current = null;
  }, []);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
