import { create } from 'zustand';

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
  selectAssets: (ids: string[]) => void;
  clearSelection: () => void;
  setPageColor: (color: string) => void;
  reorderAssets: (from: number, to: number) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
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

  selectAssets: (selectedIds) => set({ selectedIds }),
  
  clearSelection: () => set({ selectedIds: [] }),

  setPageColor: (pageColor) => set({ pageColor }),

  reorderAssets: (from, to) => set((state) => {
    const newAssets = [...state.assets];
    const [removed] = newAssets.splice(from, 1);
    newAssets.splice(to, 0, removed);
    return { assets: newAssets };
  }),
}));
