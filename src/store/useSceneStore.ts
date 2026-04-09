import { create } from 'zustand';
import { temporal } from 'zundo';

export type AssetType = 'rect' | 'circle' | 'text' | 'image' | 'path' | 'comment' | 'frame';

export interface Asset {
  id: string;
  type: AssetType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  name: string;
  visible: boolean;
  locked: boolean;
  parentId: string | null;
  properties: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    cornerRadius?: number;
    text?: string;
    fontSize?: number;
    fontWeight?: string | number;
    fontFamily?: string;
    fontStyle?: string;
    textAlign?: string;
    lineHeight?: number;
    opacity?: number;
    src?: string;
    pathPoints?: { x: number; y: number; cx1?: number; cy1?: number; cx2?: number; cy2?: number }[];
    [key: string]: any;
  };
}

interface SceneState {
  assets: Asset[];
  selectedIds: string[];
  pageColor: string;
  
  // Actions
  addAsset: (asset: Asset) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  removeAsset: (id: string) => void;
  removeAssets: (ids: string[]) => void;
  selectAssets: (ids: string[]) => void;
  clearSelection: () => void;
  setPageColor: (color: string) => void;
  reorderAssets: (from: number, to: number) => void;
}

export const useSceneStore = create<SceneState>()(
  temporal((set) => ({
    assets: [],
    selectedIds: [],
    pageColor: '#1E1E1E',

    addAsset: (asset) => set((state) => ({ 
      assets: [...state.assets, asset] 
    })),

    updateAsset: (id, updates) => set((state) => ({
      assets: state.assets.map((a) => (a.id === id ? { ...a, ...updates } : a))
    })),

    removeAsset: (id) => set((state) => ({
      assets: state.assets.filter((a) => a.id !== id && a.parentId !== id),
      selectedIds: state.selectedIds.filter((sid) => sid !== id)
    })),

    removeAssets: (ids) => set((state) => ({
      assets: state.assets.filter((a) => !ids.includes(a.id)),
      selectedIds: state.selectedIds.filter((sid) => !ids.includes(sid))
    })),

    selectAssets: (selectedIds) => set({ selectedIds }),
    
    clearSelection: () => set({ selectedIds: [] }),

    setPageColor: (pageColor) => set({ pageColor }),

    reorderAssets: (from, to) => set((state) => {
      const newAssets = [...state.assets];
      const [removed] = newAssets.splice(from, 1);
      newAssets.splice(to, 0, removed);
      return { assets: newAssets };
    }),
  }), {
    // Only track assets for undo/redo
    partialize: (state) => ({ assets: state.assets }),
  })
);
