export type AssetType = 'rect' | 'circle' | 'text' | 'image' | 'frame' | 'pen' | 'comment' | 'cube' | 'sphere';

export interface AssetProperties {
  width?: number;
  height?: number;
  scale?: { x: number; y: number };
  rotation?: number;
  name?: string;
  layerType?: 'basic' | 'frame' | 'component' | 'group' | 'autolayout';
  visible?: boolean;
  locked?: boolean;
  parentId?: string | null;
  fill?: string;
  fillOpacity?: number;
  fillHidden?: boolean;
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  strokePosition?: 'inside' | 'center' | 'outside';
  strokeHidden?: boolean;
  content?: string;
  src?: string | null;
  clipContent?: boolean;
  cornerRadius?: number;
  fontSize?: number;
  imageElement?: HTMLImageElement | null;
  pathPoints?: { x: number, y: number }[]; // For vector drawing
  commentText?: string;
  commentUser?: string;
  commentDate?: string;
  isResolved?: boolean;
  perspectivePoints?: { x: number, y: number }[]; // For 3D Cube/Sphere
  strokeDashArray?: number[];
  [key: string]: string | number | boolean | object | null | undefined;
}

export interface EngineMetadata {
  unityTag: string;
  unrealLayer: string;
  physicsEnabled: boolean;
}

export interface Transform {
  x: number;
  y: number;
  scale: number;
  isSelected?: boolean;
}

export class FlippyAsset {
  id: string;
  type: AssetType;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: { x: number; y: number };
  rotation: number;
  name: string;
  layerType: string;
  visible: boolean;
  locked: boolean;
  parentId: string | null;
  properties: AssetProperties;
  engineMetadata: EngineMetadata;

  constructor(type: AssetType, x: number, y: number, properties: AssetProperties = {}) {
    this.id = crypto.randomUUID();
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = properties.width || 100;
    this.height = properties.height || 100;
    this.scale = properties.scale || { x: 1, y: 1 };
    this.rotation = properties.rotation || 0;
    this.name = properties.name || `${type.charAt(0).toUpperCase() + type.slice(1)} ${Math.floor(Math.random() * 1000)}`;
    this.layerType = properties.layerType || 'basic';
    this.visible = properties.visible !== undefined ? properties.visible : true;
    this.locked = properties.locked || false;
    this.parentId = properties.parentId || null;

    this.properties = {
      fill: properties.fill || (type === 'frame' ? 'transparent' : '#FFFFFF'),
      fillOpacity: properties.fillOpacity !== undefined ? properties.fillOpacity : 100,
      stroke: properties.stroke || (type === 'frame' ? 'transparent' : '#0094FF'),
      strokeWidth: properties.strokeWidth || 1,
      strokeOpacity: properties.strokeOpacity !== undefined ? properties.strokeOpacity : 100,
      strokePosition: properties.strokePosition || 'inside',
      content: properties.content || '',
      src: properties.src || null,
      clipContent: properties.clipContent !== undefined ? properties.clipContent : (type === 'frame' ? true : false),
      cornerRadius: properties.cornerRadius || 0,
      pathPoints: properties.pathPoints || [],
      ...properties
    };

    this.engineMetadata = {
      unityTag: 'Untagged',
      unrealLayer: 'Default',
      physicsEnabled: false
    };
  }

  render(ctx: CanvasRenderingContext2D, transform: Transform, sceneGraph: SceneGraph) {
    ctx.save();

    const scale = transform.scale;
    const tw = this.width * scale * this.scale.x;
    const th = this.height * scale * this.scale.y;

    const cx = (this.x * scale + transform.x) + tw / 2;
    const cy = (this.y * scale + transform.y) + th / 2;

    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);

    const rx = -tw / 2;
    const ry = -th / 2;

    switch (this.type) {
      case 'frame':
      case 'rect': {
        const path = new Path2D();
        const radius = (this.properties.cornerRadius || 0) * scale;
        if (radius > 0) {
          path.roundRect(rx, ry, tw, th, radius);
        } else {
          path.rect(rx, ry, tw, th);
        }

        if (!this.properties.fillHidden && this.properties.fill !== 'transparent') {
          ctx.fillStyle = this.properties.fill!;
          ctx.globalAlpha = (this.properties.fillOpacity ?? 100) / 100;
          ctx.fill(path);
        }

        if (!this.properties.strokeHidden && this.properties.strokeWidth && this.properties.stroke !== 'transparent') {
          ctx.strokeStyle = this.properties.stroke!;
          ctx.lineWidth = this.properties.strokeWidth! * scale;
          ctx.globalAlpha = (this.properties.strokeOpacity ?? 100) / 100;
          ctx.stroke(path);
        }
        ctx.globalAlpha = 1.0;

        if (this.type === 'frame') {
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.font = `600 ${10 * scale}px Inter`;
          ctx.textAlign = 'left';
          ctx.fillText(this.name.toUpperCase(), rx, ry - (8 * scale));
        }
        break;
      }
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(tw, th) / 2, 0, Math.PI * 2);
        if (!this.properties.fillHidden && this.properties.fill !== 'transparent') {
          ctx.fillStyle = this.properties.fill!;
          ctx.globalAlpha = (this.properties.fillOpacity ?? 100) / 100;
          ctx.fill();
        }
        if (!this.properties.strokeHidden && this.properties.strokeWidth && this.properties.stroke !== 'transparent') {
          ctx.strokeStyle = this.properties.stroke!;
          ctx.lineWidth = this.properties.strokeWidth! * scale;
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
        break;
      case 'pen':
        if (this.properties.pathPoints && this.properties.pathPoints.length > 0) {
          ctx.beginPath();
          const pts = this.properties.pathPoints;
          ctx.moveTo(pts[0].x * scale + rx, pts[0].y * scale + ry);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x * scale + rx, pts[i].y * scale + ry);
          }
          if (!this.properties.strokeHidden) {
            ctx.strokeStyle = this.properties.stroke!;
            ctx.lineWidth = (this.properties.strokeWidth || 1) * scale;
            ctx.stroke();
          }
        }
        break;
      case 'image':
        if (this.properties.imageElement) {
          ctx.drawImage(this.properties.imageElement, rx, ry, tw, th);
        }
        break;
      case 'text':
        ctx.fillStyle = this.properties.fill || '#FFFFFF';
        ctx.font = `${(this.properties.fontSize || 16) * scale}px Inter`;
        ctx.fillText(this.properties.content || '', rx, ry + (this.properties.fontSize || 16) * scale);
        break;
      case 'comment':
        // Draw comment pin
        ctx.fillStyle = this.properties.isResolved ? '#4ADE80' : '#F87171';
        ctx.beginPath();
        ctx.arc(0, 0, 10 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2 * scale;
        ctx.stroke();
        break;
      case 'cube':
        // Modern 3D Perspective Grid logic
        ctx.strokeStyle = 'rgba(0, 148, 255, 0.3)';
        ctx.lineWidth = 1 * scale;
        // Draw perspective lines (simplified for now)
        for (let i = -5; i <= 5; i++) {
          ctx.beginPath();
          ctx.moveTo(rx + (i + 5) * (tw/10), ry);
          ctx.lineTo(rx + (i + 5) * (tw/10) + 100 * scale, ry + th);
          ctx.stroke();
        }
        break;
      case 'sphere':
        // Semi-transparent 3D Sphere guide
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1 * scale;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.ellipse(0, 0, (tw/2) * scale, (th/2) * (1 - i*0.3) * scale, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(0, 0, (tw/2) * (1 - i*0.3) * scale, (th/2) * scale, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
    }

    ctx.restore();

    if (sceneGraph) {
      const children = sceneGraph.assets.filter(a => a.parentId === this.id);
      if (children.length > 0) {
        ctx.save();
        if (this.type === 'frame' && this.properties.clipContent) {
          ctx.translate(cx, cy);
          ctx.rotate(this.rotation);

          const clipPath = new Path2D();
          const radius = (this.properties.cornerRadius || 0) * scale;
          if (radius > 0) {
            clipPath.roundRect(rx, ry, tw, th, radius);
          } else {
            clipPath.rect(rx, ry, tw, th);
          }
          ctx.clip(clipPath);

          ctx.rotate(-this.rotation);
          ctx.translate(-cx, -cy);
        }
        children.forEach(child => {
          if (!child.visible) return;
          const t = { ...transform, isSelected: sceneGraph.selectedAssetIds.has(child.id) };
          child.render(ctx, t, sceneGraph);
        });
        ctx.restore();
      }
    }

    if (transform.isSelected) {
      this.drawSelectionUI(ctx, transform);
    }
  }

  drawSelectionUI(ctx: CanvasRenderingContext2D, transform: Transform) {
    ctx.save();
    const { x, y, scale } = transform;
    const tw = this.width * scale * this.scale.x;
    const th = this.height * scale * this.scale.y;

    const cx = (this.x * scale + x) + tw / 2;
    const cy = (this.y * scale + y) + th / 2;

    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);

    const rx = -tw / 2;
    const ry = -th / 2;

    ctx.strokeStyle = '#0094FF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(rx, ry, tw, th);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#0094FF';
    const hs = 6 / scale; // Scaled handle size
    
    // Corners
    const corners = [
      { x: rx, y: ry, h: 'tl' },
      { x: rx + tw, y: ry, h: 'tr' },
      { x: rx, y: ry + th, h: 'bl' },
      { x: rx + tw, y: ry + th, h: 'br' }
    ];

    corners.forEach(c => {
      ctx.beginPath();
      ctx.rect(c.x - hs / 2, c.y - hs / 2, hs, hs);
      ctx.fill();
      ctx.stroke();
    });

    // Rotation Handle (Top Center Offset)
    ctx.beginPath();
    ctx.moveTo(0, ry);
    ctx.lineTo(0, ry - 20 / scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, ry - 24 / scale, 4 / scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  getHandleAt(mouseX: number, mouseY: number, transform: Transform) {
    const { x, y, scale } = transform;
    const tw = this.width * scale * this.scale.x;
    const th = this.height * scale * this.scale.y;

    const cx = (this.x * scale + x) + tw / 2;
    const cy = (this.y * scale + y) + th / 2;

    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const cos = Math.cos(-this.rotation);
    const sin = Math.sin(-this.rotation);
    const lx = dx * cos - dy * sin;
    const ly = dx * sin + dy * cos;

    const rx = -tw / 2;
    const ry = -th / 2;

    const hs = 12;
    if (Math.abs(lx - rx) <= hs && Math.abs(ly - ry) <= hs) return 'tl';
    if (Math.abs(lx - (rx + tw)) <= hs && Math.abs(ly - ry) <= hs) return 'tr';
    if (Math.abs(lx - rx) <= hs && Math.abs(ly - (ry + th)) <= hs) return 'bl';
    if (Math.abs(lx - (rx + tw)) <= hs && Math.abs(ly - (ry + th)) <= hs) return 'br';

    // Rotation Handle Check
    const distToRotate = Math.sqrt(lx * lx + (ly - (ry - 24/scale)) * (ly - (ry - 24/scale)));
    if (distToRotate <= 15) return 'rotate';

    const isInsideRect = lx >= rx && lx <= rx + tw && ly >= ry && ly <= ry + th;
    if (isInsideRect) return 'move';

    return null;
  }

  serialize() {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      scale: { ...this.scale },
      rotation: this.rotation,
      properties: { ...this.properties },
      engineMetadata: { ...this.engineMetadata },
      name: this.name,
      layerType: this.layerType,
      visible: this.visible,
      locked: this.locked,
      parentId: this.parentId
    };
  }

  static deserialize(data: Partial<FlippyAsset> & { properties: AssetProperties }): FlippyAsset {
    const asset = new FlippyAsset(data.type!, data.x!, data.y!, data.properties);
    asset.id = data.id!;
    asset.width = data.width!;
    asset.height = data.height!;
    asset.scale = { ...data.scale! };
    asset.rotation = data.rotation!;
    asset.engineMetadata = { ...data.engineMetadata! };
    asset.name = data.name!;
    asset.layerType = data.layerType!;
    asset.visible = data.visible!;
    asset.locked = data.locked!;
    asset.parentId = data.parentId!;
    return asset;
  }
}

type Listener = () => void;

export class SceneGraph {
  private static instance: SceneGraph;
  assets: FlippyAsset[] = [];
  selectedAssetIds: Set<string> = new Set();
  pageColor: string = '#1E1E1E';
  private listeners: Set<Listener> = new Set();

  private constructor() { }

  static getInstance(): SceneGraph {
    if (!SceneGraph.instance) {
      SceneGraph.instance = new SceneGraph();
    }
    return SceneGraph.instance;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(l => l());
  }

  addAsset(asset: FlippyAsset) {
    this.assets.push(asset);
    this.notify();
    return asset.id;
  }

  removeAsset(id: string) {
    this.assets = this.assets.filter(a => a.id !== id && a.parentId !== id);
    if (this.selectedAssetIds.has(id)) this.selectedAssetIds.delete(id);
    this.notify();
  }

  updateAsset(id: string, updates: Partial<FlippyAsset>) {
    const asset = this.assets.find(a => a.id === id);
    if (asset) {
      Object.assign(asset, updates);
      this.notify();
    }
  }

  updateAssetProperties(id: string, props: Partial<AssetProperties>) {
    const asset = this.assets.find(a => a.id === id);
    if (asset) {
      asset.properties = { ...asset.properties, ...props };
      this.notify();
    }
  }

  reorderAsset(id: string, newIndex: number) {
    const index = this.assets.findIndex(a => a.id === id);
    if (index > -1) {
      const [asset] = this.assets.splice(index, 1);
      this.assets.splice(newIndex, 0, asset);
      this.notify();
    }
  }

  getAssetAt(x: number, y: number, transform: Transform) {
    for (let i = this.assets.length - 1; i >= 0; i--) {
      const asset = this.assets[i];
      if (!asset.visible || asset.locked) continue;

      const handle = asset.getHandleAt(x, y, transform);
      if (handle) return { asset, handle };

      const scale = transform.scale;
      const tw = asset.width * scale * asset.scale.x;
      const th = asset.height * scale * asset.scale.y;
      const cx = (asset.x * scale + transform.x) + tw / 2;
      const cy = (asset.y * scale + transform.y) + th / 2;

      const dx = x - cx;
      const dy = y - cy;
      const cos = Math.cos(-asset.rotation);
      const sin = Math.sin(-asset.rotation);
      const lx = dx * cos - dy * sin;
      const ly = dx * sin + dy * cos;

      if (lx >= -tw / 2 && lx <= tw / 2 && ly >= -th / 2 && ly <= th / 2) {
        return { asset, handle: 'move' };
      }
    }
    return null;
  }

  getAssetsInRect(x1: number, y1: number, x2: number, y2: number, transform: Transform) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    return this.assets.filter(asset => {
      if (!asset.visible || asset.locked) return false;
      const ax = asset.x * transform.scale + transform.x;
      const ay = asset.y * transform.scale + transform.y;
      const aw = asset.width * transform.scale;
      const ah = asset.height * transform.scale;

      const acx = ax + aw / 2;
      const acy = ay + ah / 2;
      return acx >= minX && acx <= maxX && acy >= minY && acy <= maxY;
    });
  }

  serialize() {
    return {
      pageColor: this.pageColor,
      assets: this.assets.map(a => a.serialize())
    };
  }

  deserialize(data: { pageColor?: string, assets?: Partial<FlippyAsset>[] } | Partial<FlippyAsset>[]) {
    if (Array.isArray(data)) {
      this.pageColor = '#1E1E1E';
      this.assets = data.map(d => FlippyAsset.deserialize(d as any));
    } else {
      this.pageColor = data.pageColor || '#1E1E1E';
      this.assets = (data.assets || []).map((d: any) => FlippyAsset.deserialize(d));
    }
    this.notify();
  }

  selectAsset(id: string, multiple: boolean = false) {
    if (!multiple) this.selectedAssetIds.clear();
    this.selectedAssetIds.add(id);
    this.notify();
  }

  deselectAsset(id: string) {
    this.selectedAssetIds.delete(id);
    this.notify();
  }

  clearSelection() {
    this.selectedAssetIds.clear();
    this.notify();
  }

  alignAssets(type: 'align-left' | 'align-h-center' | 'align-right' | 'align-top' | 'align-v-center' | 'align-bottom') {
    const ids = Array.from(this.selectedAssetIds);
    if (ids.length <= 1) return;

    const assets = ids.map(id => this.assets.find(a => a.id === id)).filter(Boolean) as FlippyAsset[];
    if (assets.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    assets.forEach(a => {
      minX = Math.min(minX, a.x);
      minY = Math.min(minY, a.y);
      maxX = Math.max(maxX, a.x + a.width);
      maxY = Math.max(maxY, a.y + a.height);
    });

    const centerX = minX + (maxX - minX) / 2;
    const centerY = minY + (maxY - minY) / 2;

    assets.forEach(a => {
      switch (type) {
        case 'align-left': a.x = minX; break;
        case 'align-h-center': a.x = centerX - a.width / 2; break;
        case 'align-right': a.x = maxX - a.width; break;
        case 'align-top': a.y = minY; break;
        case 'align-v-center': a.y = centerY - a.height / 2; break;
        case 'align-bottom': a.y = maxY - a.height; break;
      }
    });
    this.notify();
  }
}

export const sceneGraph = SceneGraph.getInstance();
