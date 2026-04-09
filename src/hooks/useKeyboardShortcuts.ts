import { useEffect, useCallback } from 'react';
import { useSceneStore } from '../store/useSceneStore';
import { useEditorStore } from '../store/useEditorStore';
import { type Asset } from '../store/useSceneStore';

export const useKeyboardShortcuts = () => {
  const { assets, selectedIds, removeAssets, addAsset, selectAssets } = useSceneStore();
  const { clipboard, setClipboard, activeTool } = useEditorStore();

  const handleCopy = useCallback(() => {
    if (selectedIds.length === 0) return;
    const selectedAssets = assets.filter(a => selectedIds.includes(a.id));
    const serialized = selectedAssets.map(a => JSON.stringify(a));
    setClipboard(serialized);
  }, [assets, selectedIds, setClipboard]);

  const handlePaste = useCallback(() => {
    if (clipboard.length === 0) return;
    
    const newIds: string[] = [];
    clipboard.forEach(json => {
      const asset: Asset = JSON.parse(json);
      const newId = crypto.randomUUID();
      const pastedAsset: Asset = {
        ...asset,
        id: newId,
        x: asset.x + 20,
        y: asset.y + 20,
        name: `${asset.name} (Copy)`
      };
      addAsset(pastedAsset);
      newIds.push(newId);
    });
    
    selectAssets(newIds);
  }, [clipboard, addAsset, selectAssets]);

  const handleDelete = useCallback(() => {
    if (selectedIds.length > 0) {
      removeAssets(selectedIds);
    }
  }, [selectedIds, removeAssets]);

  const handleUndo = useCallback(() => {
    // temporal is available on useSceneStore as a static property or via useStore.temporal
    (useSceneStore as any).temporal.getState().undo();
  }, []);

  const handleRedo = useCallback(() => {
    (useSceneStore as any).temporal.getState().redo();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const isMod = e.ctrlKey || e.metaKey;

      if (isMod && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopy();
      }
      if (isMod && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePaste();
      }
      if (isMod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      }
      if (isMod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Only delete if not active drawing/typing
        if (activeTool === 'cursor') {
          handleDelete();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleCopy, handlePaste, handleUndo, handleRedo, handleDelete, activeTool]);
};
