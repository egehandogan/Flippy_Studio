import { create } from 'zustand';

export type ToolType = 
  | 'cursor'    // V: Select/Move/Transform
  | 'rect'      // R: Rectangle
  | 'circle'    // O: Ellipse
  | 'text'      // T: Text
  | 'pen'       // P: Pen/Vector
  | 'pan'       // H: Hand/Pan
  | 'comment'   // C: Comment Pins
  | 'component' // Alt+C: 3D/Reusable assets
  | 'prototype' // P: Interaction linking
  | 'frame'     // F: Artboards/Layout containers
  | 'add';      // Importer

interface EditorState {
  activeTool: ToolType;
  zoom: number;
  panning: { x: number; y: number };
  clipboard: string[]; // JSON serialized assets
  editingTextId: string | null;
  
  // Actions
  setTool: (tool: ToolType) => void;
  setZoom: (zoom: number) => void;
  setPanning: (panning: { x: number; y: number }) => void;
  setClipboard: (clipboard: string[]) => void;
  setEditingTextId: (id: string | null) => void;
  resetView: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  activeTool: 'cursor',
  zoom: 1,
  panning: { x: 0, y: 0 },
  clipboard: [],
  editingTextId: null,

  setTool: (activeTool) => set({ activeTool }),
  setZoom: (zoom) => set({ zoom: Math.max(0.01, Math.min(20, zoom)) }),
  setPanning: (panning) => set({ panning }),
  setClipboard: (clipboard) => set({ clipboard }),
  setEditingTextId: (editingTextId) => set({ editingTextId }),
  resetView: () => set({ zoom: 1, panning: { x: 0, y: 0 } }),
}));
