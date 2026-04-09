import { SceneGraph } from './SceneGraph';

export class HistoryManager {
  private sceneGraph: SceneGraph;
  private limit: number;
  private undoStack: string[] = [];
  onStateChange: (() => void) | null = null;

  constructor(sceneGraph: SceneGraph, limit = 50) {
    this.sceneGraph = sceneGraph;
    this.limit = limit;
    this.saveState(); // Initial state
  }

  saveState() {
    if (this.undoStack.length >= this.limit) {
      this.undoStack.shift();
    }
    this.undoStack.push(JSON.stringify(this.sceneGraph.serialize()));
    if (this.onStateChange) this.onStateChange();
  }

  undo() {
    if (this.undoStack.length > 1) {
      this.undoStack.pop(); // Remove current state
      const previousState = this.undoStack[this.undoStack.length - 1];
      this.sceneGraph.deserialize(JSON.parse(previousState));
      this.sceneGraph.selectedAssetIds.clear();
      if (this.onStateChange) this.onStateChange();
    }
  }
}
