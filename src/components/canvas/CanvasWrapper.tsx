import React from 'react';
import KonvaRenderer from './KonvaRenderer';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import TextEditorOverlay from './TextEditorOverlay';

const CanvasWrapper: React.FC = () => {
  // Initialize global shortcuts
  useKeyboardShortcuts();

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0A0A0A]">
      {/* The main Konva Stage */}
      <KonvaRenderer />

      {/* HTML Overlay for Text Editing */}
      <TextEditorOverlay />

      {/* Canvas Interaction UI Overlay (Optional: Guides, selection boxes etc) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Placeholder for future non-canvas UI elements on top of workspace */}
      </div>
    </div>
  );
};

export default CanvasWrapper;
