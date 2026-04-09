import { create } from 'zustand';

export interface TrainingImage {
  id: string;
  url: string;       // base64 or object URL
  file: File | null;
  description: string;
}

export interface TrainingFolder {
  id: string;
  name: string;
  images: TrainingImage[];
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  timestamp: number;
}

export type TrainingStatus = 'idle' | 'training' | 'success' | 'error';
export type AIView = 'home' | 'train' | 'generate';
export type AIProvider = 'huggingface' | 'pollinations';

interface AIState {
  // Navigation
  view: AIView;
  setView: (view: AIView) => void;

  // Training
  folders: TrainingFolder[];
  activeFolderId: string | null;
  trainingStatus: TrainingStatus;
  trainingProgress: number;
  trainingLogs: string[];

  addFolder: (name: string) => void;
  setActiveFolder: (id: string) => void;
  addImageToSlot: (folderId: string, slotIndex: number, file: File, url: string) => void;
  updateImageDescription: (folderId: string, imageId: string, description: string) => void;
  removeImage: (folderId: string, imageId: string) => void;
  setTrainingStatus: (status: TrainingStatus) => void;
  setTrainingProgress: (progress: number) => void;
  addTrainingLog: (log: string) => void;
  resetTraining: () => void;

  // Generation
  selectedModel: string;
  prompt: string;
  negativePrompt: string;
  styleDetails: string;
  isGenerating: boolean;
  generatedImages: GeneratedImage[];
  activeProvider: AIProvider;

  setSelectedModel: (model: string) => void;
  setPrompt: (prompt: string) => void;
  setNegativePrompt: (negativePrompt: string) => void;
  setStyleDetails: (styleDetails: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setProvider: (provider: AIProvider) => void;
  addGeneratedImage: (image: GeneratedImage) => void;
  removeGeneratedImage: (id: string) => void;

  // Selectors
  isReadyToTrain: () => boolean;
}

const createEmptySlots = (count: number): TrainingImage[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `slot-${i}`,
    url: '',
    file: null,
    description: '',
  }));

export const useAIStore = create<AIState>((set, get) => ({
  // Navigation
  view: 'home',
  setView: (view) => set({ view }),

  // Training
  folders: [{ id: 'default', name: 'My First Model', images: createEmptySlots(12) }],
  activeFolderId: 'default',
  trainingStatus: 'idle',
  trainingProgress: 0,
  trainingLogs: [],

  addFolder: (name) => {
    const id = crypto.randomUUID();
    set((state) => ({
      folders: [...state.folders, { id, name, images: createEmptySlots(12) }],
      activeFolderId: id,
    }));
  },

  setActiveFolder: (id) => set({ activeFolderId: id }),

  addImageToSlot: (folderId, slotIndex, file, url) =>
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === folderId
          ? {
              ...f,
              images: f.images.map((img, i) =>
                i === slotIndex ? { ...img, url, file, id: crypto.randomUUID() } : img
              ),
            }
          : f
      ),
    })),

  updateImageDescription: (folderId, imageId, description) =>
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === folderId
          ? {
              ...f,
              images: f.images.map((img) =>
                img.id === imageId ? { ...img, description } : img
              ),
            }
          : f
      ),
    })),

  removeImage: (folderId, imageId) =>
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === folderId
          ? {
              ...f,
              images: f.images.map((img) =>
                img.id === imageId ? { ...img, url: '', file: null, description: '' } : img
              ),
            }
          : f
      ),
    })),

  setTrainingStatus: (trainingStatus) => set({ trainingStatus }),
  setTrainingProgress: (trainingProgress) => set({ trainingProgress }),
  addTrainingLog: (log) => set((state) => ({ trainingLogs: [...state.trainingLogs, log] })),
  resetTraining: () => set({ trainingStatus: 'idle', trainingProgress: 0, trainingLogs: [] }),

  // Generation
  selectedModel: 'stable-diffusion',
  prompt: '',
  negativePrompt: '',
  styleDetails: '',
  isGenerating: false,
  generatedImages: [],
  activeProvider: 'pollinations',

  setSelectedModel: (selectedModel) => set({ selectedModel }),
  setPrompt: (prompt) => set({ prompt }),
  setNegativePrompt: (negativePrompt) => set({ negativePrompt }),
  setStyleDetails: (styleDetails) => set({ styleDetails }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setProvider: (activeProvider) => set({ activeProvider, selectedModel: activeProvider === 'pollinations' ? 'flux' : 'sd-15' }),
  addGeneratedImage: (image) =>
    set((state) => ({ generatedImages: [image, ...state.generatedImages] })),
  removeGeneratedImage: (id) =>
    set((state) => ({ generatedImages: state.generatedImages.filter((img) => img.id !== id) })),

  // Selectors
  isReadyToTrain: () => {
    const state = get();
    const folder = state.folders.find((f) => f.id === state.activeFolderId);
    if (!folder) return false;
    const filledSlots = folder.images.filter((img) => img.url !== '');
    return filledSlots.length >= 6;
  },
}));
