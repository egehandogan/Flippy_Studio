export type ToolType = 'add' | 'cursor' | 'rect' | 'circle' | 'text' | 'cube' | 'sphere' | 'pen' | 'pan' | 'comment' | 'size' | 'zoom' | 'export';

type Listener = () => void;

class EditorService {
  private static instance: EditorService;
  activeTool: ToolType = 'cursor';
  zoom: number = 100;
  private listeners: Set<Listener> = new Set();

  private constructor() { }

  static getInstance(): EditorService {
    if (!EditorService.instance) {
      EditorService.instance = new EditorService();
    }
    return EditorService.instance;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  setTool(tool: ToolType) {
    this.activeTool = tool;
    this.notify();
  }

  setZoom(zoom: number) {
    this.zoom = zoom;
    this.notify();
  }

  autoZoom() {
    this.notify();
  }
}

export const editorService = EditorService.getInstance();
