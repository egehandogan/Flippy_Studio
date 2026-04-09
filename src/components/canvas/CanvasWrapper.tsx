import React, { useEffect, useRef, useState } from 'react';
import { CanvasEngine } from '../../core/CanvasEngine';
import { sceneGraph, FlippyAsset } from '../../core/SceneGraph';
import type { AssetType } from '../../core/SceneGraph';
import { useEditorState } from '../../hooks/useEditorState';

const CanvasWrapper: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);
  const [marqueeRect, setMarqueeRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const { activeTool, setTool, setZoom } = useEditorState();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new CanvasEngine(canvas);
    engineRef.current = engine;
    engine.resetTransform();
    engine.startRenderLoop(sceneGraph);

    let interactionMode: 'none' | 'moving' | 'resizing' | 'rotating' | 'drawing' | 'marquee' | 'pen' | 'pan' = 'none';
    let dragStartOffset = { x: 0, y: 0 };
    let startWorldPos = { x: 0, y: 0 };
    let currentAssetId: string | null = null;
    let currentHandle: string | null = null;
    
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0 && e.button !== 1) return;
      
      const canvasSpace = engine.getMouseInCanvasSpace(e.clientX, e.clientY);
      const worldStart = engine.getMouseInWorldSpace(e.clientX, e.clientY);
      startWorldPos = worldStart;

      // Handle Panning (Middle Mouse or Space+Left)
      if (e.button === 1 || (e.button === 0 && (e.altKey || activeTool === 'pan'))) {
        interactionMode = 'pan';
        return;
      }

      const hit = sceneGraph.getAssetAt(canvasSpace.x, canvasSpace.y, engine.transform);

      if (activeTool === 'cursor') {
        if (hit) {
          const { asset, handle } = hit;
          currentAssetId = asset.id;
          currentHandle = handle;

          if (handle === 'move') {
            interactionMode = 'moving';
            sceneGraph.selectAsset(asset.id, e.shiftKey);
            dragStartOffset = { x: asset.x - worldStart.x, y: asset.y - worldStart.y };
          } else if (handle === 'rotate') {
            interactionMode = 'rotating';
          } else {
            interactionMode = 'resizing';
          }
        } else {
          interactionMode = 'marquee';
          if (!e.shiftKey) sceneGraph.clearSelection();
        }
      } else if (['rect', 'circle', 'frame', 'cube', 'sphere', 'comment'].includes(activeTool)) {
        interactionMode = 'drawing';
        const initialProps = activeTool === 'comment' ? { width: 40, height: 40 } : { width: 1, height: 1 };
        const asset = new FlippyAsset(activeTool as AssetType, worldStart.x, worldStart.y, initialProps);
        currentAssetId = sceneGraph.addAsset(asset);
        sceneGraph.selectAsset(asset.id);
      } else if (activeTool === 'pen') {
        interactionMode = 'pen';
        // Pen logic simplified: continuous points
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const worldPos = engine.getMouseInWorldSpace(e.clientX, e.clientY);
      setZoom(Math.round(engine.transform.scale * 100));

      if (interactionMode === 'pan') {
        // Pan handled by CanvasEngine.bindEvents internally, but we can sync if needed
      } else if (interactionMode === 'moving') {
        sceneGraph.selectedAssetIds.forEach(id => {
          const asset = sceneGraph.assets.find(a => a.id === id);
          if (asset && !asset.locked) {
            asset.x = worldPos.x + dragStartOffset.x;
            asset.y = worldPos.y + dragStartOffset.y;
          }
        });
        sceneGraph.notify();
      } else if (interactionMode === 'drawing' && currentAssetId) {
        const asset = sceneGraph.assets.find(a => a.id === currentAssetId);
        if (asset) {
          let dx = worldPos.x - startWorldPos.x;
          let dy = worldPos.y - startWorldPos.y;

          if (e.shiftKey) {
            const size = Math.max(Math.abs(dx), Math.abs(dy));
            dx = Math.sign(dx) * size;
            dy = Math.sign(dy) * size;
          }

          asset.width = Math.max(1, Math.abs(dx));
          asset.height = Math.max(1, Math.abs(dy));
          asset.x = dx > 0 ? startWorldPos.x : startWorldPos.x + dx;
          asset.y = dy > 0 ? startWorldPos.y : startWorldPos.y + dy;
          sceneGraph.notify();
        }
      } else if (interactionMode === 'marquee') {
        const canvasSpace = engine.getMouseInCanvasSpace(e.clientX, e.clientY);
        const startCanvasPos = {
          x: startWorldPos.x * engine.transform.scale + engine.transform.x,
          y: startWorldPos.y * engine.transform.scale + engine.transform.y
        };

        const x1 = Math.min(canvasSpace.x, startCanvasPos.x);
        const y1 = Math.min(canvasSpace.y, startCanvasPos.y);
        const x2 = Math.max(canvasSpace.x, startCanvasPos.x);
        const y2 = Math.max(canvasSpace.y, startCanvasPos.y);
        
        setMarqueeRect({ x: x1, y: y1, w: x2 - x1, h: y2 - y1 });
        
        const assets = sceneGraph.getAssetsInRect(x1, y1, x2, y2, engine.transform);
        sceneGraph.selectedAssetIds.clear();
        assets.forEach(a => sceneGraph.selectedAssetIds.add(a.id));
        sceneGraph.notify();
      } else if (interactionMode === 'resizing' && currentAssetId && currentHandle) {
        const asset = sceneGraph.assets.find(a => a.id === currentAssetId);
        if (asset) {
          if (currentHandle === 'br') {
            asset.width = Math.max(1, worldPos.x - asset.x);
            asset.height = Math.max(1, worldPos.y - asset.y);
          } else if (currentHandle === 'tl') {
            const dx = asset.x - worldPos.x;
            const dy = asset.y - worldPos.y;
            asset.width = Math.max(1, asset.width + dx);
            asset.height = Math.max(1, asset.height + dy);
            asset.x = worldPos.x;
            asset.y = worldPos.y;
          } else if (currentHandle === 'tr') {
            asset.width = Math.max(1, worldPos.x - asset.x);
            const dy = asset.y - worldPos.y;
            asset.height = Math.max(1, asset.height + dy);
            asset.y = worldPos.y;
          } else if (currentHandle === 'bl') {
            const dx = asset.x - worldPos.x;
            asset.width = Math.max(1, asset.width + dx);
            asset.height = Math.max(1, worldPos.y - asset.y);
            asset.x = worldPos.x;
          }
          sceneGraph.notify();
        }
      } else if (interactionMode === 'rotating' && currentAssetId) {
        const asset = sceneGraph.assets.find(a => a.id === currentAssetId);
        if (asset) {
          const cx = asset.x + asset.width / 2;
          const cy = asset.y + asset.height / 2;
          asset.rotation = Math.atan2(worldPos.y - cy, worldPos.x - cx) + Math.PI / 2;
          sceneGraph.notify();
        }
      }
    };

    const onMouseUp = () => {
      if (interactionMode === 'drawing') {
        setTool('cursor');
      }
      interactionMode = 'none';
      currentAssetId = null;
      currentHandle = null;
      setMarqueeRect(null);
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      engine.stopRenderLoop();
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [activeTool, setTool, setZoom]);

  return (
    <div className="w-full h-full bg-[#0A0A0A] overflow-hidden relative">
      <canvas 
        ref={canvasRef} 
        className={`block touch-none outline-none ${activeTool === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
        tabIndex={0}
      />
      {marqueeRect && (
        <div 
          className="absolute border border-flippy-blue bg-flippy-blue/10 pointer-events-none z-50"
          style={{
            left: marqueeRect.x,
            top: marqueeRect.y,
            width: marqueeRect.w,
            height: marqueeRect.h
          }}
        />
      )}
    </div>
  );
};

export default CanvasWrapper;
