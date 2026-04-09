import { SceneGraph, FlippyAsset } from './SceneGraph';

export class ClipboardManager {
  private sceneGraph: SceneGraph;
  private clipboard: string[] = [];
  private pasteCount: number = 0;

  constructor(sceneGraph: SceneGraph) {
    this.sceneGraph = sceneGraph;
  }

  copy() {
    this.clipboard = [];
    this.pasteCount = 0;
    this.sceneGraph.selectedAssetIds.forEach(id => {
      const asset = this.sceneGraph.assets.find(a => a.id === id);
      if (asset) {
        this.clipboard.push(JSON.stringify(asset.serialize()));
      }
    });
  }

  paste() {
    if (this.clipboard.length === 0) return;
    this.pasteCount++;
    const offset = this.pasteCount * 20;

    this.sceneGraph.selectedAssetIds.clear();

    this.clipboard.forEach(dataString => {
      const data = JSON.parse(dataString);
      const clone = FlippyAsset.deserialize(data);
      clone.id = crypto.randomUUID();
      clone.x += offset;
      clone.y += offset;
      this.sceneGraph.addAsset(clone);
      this.sceneGraph.selectedAssetIds.add(clone.id);
    });
  }
}
