import { SceneGraph } from './SceneGraph';
import type { Transform } from './SceneGraph';

export class CanvasEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  transform: Transform = { x: 0, y: 0, scale: 1 };
  isPanning: boolean = false;
  lastMousePos: { x: number; y: number } = { x: 0, y: 0 };
  gridSpacing: number = 24;
  private _rafId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.bindEvents();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private bindEvents() {
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomSpeed = 0.002;
      const delta = -e.deltaY * zoomSpeed;
      const newScale = Math.max(0.1, Math.min(10, this.transform.scale * (1 + delta)));

      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const worldX = (mouseX - this.transform.x) / this.transform.scale;
      const worldY = (mouseY - this.transform.y) / this.transform.scale;

      this.transform.scale = newScale;
      this.transform.x = mouseX - worldX * this.transform.scale;
      this.transform.y = mouseY - worldY * this.transform.scale;
    }, { passive: false });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        this.isPanning = true;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isPanning) {
        const dx = e.clientX - this.lastMousePos.x;
        const dy = e.clientY - this.lastMousePos.y;
        this.transform.x += dx;
        this.transform.y += dy;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mouseup', () => {
      this.isPanning = false;
    });
  }

  resetTransform() {
    this.transform = { x: window.innerWidth / 2, y: window.innerHeight / 2, scale: 1 };
  }

  draw(sceneGraph: SceneGraph) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = sceneGraph.pageColor || '#0A0A0A';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawGrid();

    const rootAssets = sceneGraph.assets.filter(a => !a.parentId);
    rootAssets.forEach(asset => {
      if (!asset.visible) return;
      const t = { ...this.transform, isSelected: sceneGraph.selectedAssetIds.has(asset.id) };
      asset.render(this.ctx, t, sceneGraph);
    });
  }

  startRenderLoop(sceneGraph: SceneGraph) {
    if (this._rafId) cancelAnimationFrame(this._rafId);
    const loop = () => {
      this.draw(sceneGraph);
      this._rafId = requestAnimationFrame(loop);
    };
    this._rafId = requestAnimationFrame(loop);
  }

  stopRenderLoop() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  private drawGrid() {
    const { x, y, scale } = this.transform;
    const spacing = this.gridSpacing * scale;

    const offsetX = x % spacing;
    const offsetY = y % spacing;

    const opacity = Math.min(0.2, 0.05 * scale);
    this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

    if (scale < 0.15) return;

    const dotSize = Math.max(0.5, 0.8 * Math.min(1.2, scale));

    for (let gx = offsetX; gx < this.canvas.width; gx += spacing) {
      for (let gy = offsetY; gy < this.canvas.height; gy += spacing) {
        this.ctx.beginPath();
        this.ctx.arc(gx, gy, dotSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  getMouseInWorldSpace(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    return {
      x: (mouseX - this.transform.x) / this.transform.scale,
      y: (mouseY - this.transform.y) / this.transform.scale
    };
  }

  getMouseInCanvasSpace(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  autoZoom(sceneGraph: SceneGraph) {
    if (sceneGraph.assets.length === 0) return;

    let minX = Infinity, minY = Infinity, maxY = -Infinity, maxX = -Infinity;
    sceneGraph.assets.forEach(a => {
      minX = Math.min(minX, a.x);
      minY = Math.min(minY, a.y);
      maxX = Math.max(maxX, a.x + a.width);
      maxY = Math.max(maxY, a.y + a.height);
    });

    const boundsW = maxX - minX;
    const boundsH = maxY - minY;
    const padding = 100;

    const scaleX = (this.canvas.width - padding * 2) / boundsW;
    const scaleY = (this.canvas.height - padding * 2) / boundsH;
    const newScale = Math.max(0.1, Math.min(2, Math.min(scaleX, scaleY)));

    this.transform.scale = newScale;
    this.transform.x = this.canvas.width / 2 - (minX + boundsW / 2) * newScale;
    this.transform.y = this.canvas.height / 2 - (minY + boundsH / 2) * newScale;
  }
}
