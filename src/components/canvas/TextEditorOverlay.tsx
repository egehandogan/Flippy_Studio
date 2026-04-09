import React, { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useSceneStore } from '../../store/useSceneStore';

const TextEditorOverlay: React.FC = () => {
  const { editingTextId, setEditingTextId, zoom, panning } = useEditorStore();
  const { assets, updateAsset } = useSceneStore();
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeAsset = assets.find(a => a.id === editingTextId);

  useEffect(() => {
    if (activeAsset) {
      setValue(activeAsset.properties.text || '');
      // Focus after a short delay to ensure it's rendered
      setTimeout(() => textareaRef.current?.focus(), 10);
    }
  }, [editingTextId, activeAsset]);

  if (!activeAsset) return null;

  // Calculate screen position
  // ScreenPos = (WorldPos * Zoom) + Panning
  const left = (activeAsset.x * zoom) + panning.x;
  const top = (activeAsset.y * zoom) + panning.y;
  const width = activeAsset.width * zoom;
  const height = activeAsset.height * zoom;

  const handleBlur = () => {
    updateAsset(activeAsset.id, { 
      properties: { ...activeAsset.properties, text: value } 
    });
    setEditingTextId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setEditingTextId(null);
    }
  };

  return (
    <div 
      className="absolute z-[100] pointer-events-none"
      style={{ left: 0, top: 0, width: '100%', height: '100%' }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="absolute bg-black border-2 border-flippy-blue text-white outline-none resize-none overflow-hidden p-0 m-0 pointer-events-auto shadow-2xl"
        style={{
          left,
          top,
          width: Math.max(width, 100),
          height: Math.max(height, 30),
          fontSize: (activeAsset.properties.fontSize || 16) * zoom,
          fontFamily: activeAsset.properties.fontFamily || 'Inter, sans-serif',
          fontWeight: activeAsset.properties.fontWeight || 'normal',
          textAlign: activeAsset.properties.textAlign as any || 'left',
          lineHeight: activeAsset.properties.lineHeight || 1.2,
          color: activeAsset.properties.fill || '#FFFFFF',
        }}
      />
    </div>
  );
};

export default TextEditorOverlay;
