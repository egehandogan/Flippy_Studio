/**
 * CanvasEngine for Flippy Studio
 * Handles rendering, panning, zooming, and grid logic.
 */

export class CanvasEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.transform = { x: 0, y: 0, scale: 1 };
        this.isPanning = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.gridSpacing = 24; // Base spacing for dots
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.bindEvents();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    bindEvents() {
        // Zoom: Mouse Wheel
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.002;
            const delta = -e.deltaY * zoomSpeed;
            const newScale = Math.max(0.1, Math.min(10, this.transform.scale * (1 + delta)));
            
            // Zoom towards mouse position
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const worldX = (mouseX - this.transform.x) / this.transform.scale;
            const worldY = (mouseY - this.transform.y) / this.transform.scale;
            
            this.transform.scale = newScale;
            this.transform.x = mouseX - worldX * this.transform.scale;
            this.transform.y = mouseY - worldY * this.transform.scale;
        }, { passive: false });

        // Pan: Middle mouse or Space+Drag
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
        this.transform = { x: window.innerWidth/2, y: window.innerHeight/2, scale: 1 };
    }

    draw(sceneGraph) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = sceneGraph.pageColor || '#1E1E1E';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 1. Draw Infinite Grid (Dots)
        this.drawGrid();
        
        // 2. Draw Scene Graph
        const rootAssets = sceneGraph.assets.filter(a => !a.parentId);
        rootAssets.forEach(asset => {
            if (!asset.visible) return;
            const t = { ...this.transform, isSelected: sceneGraph.selectedAssetIds.has(asset.id) };
            asset.render(this.ctx, t, sceneGraph);
        });
        
        requestAnimationFrame(() => this.draw(sceneGraph));
    }

    drawGrid() {
        const { x, y, scale } = this.transform;
        const spacing = this.gridSpacing * scale;
        
        // Calculate grid start position
        const offsetX = x % spacing;
        const offsetY = y % spacing;
        
        this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.2, 0.05 * scale)})`; // Dynamic opacity
        
        // Skip drawing if scale is too small
        if (scale < 0.2) return;

        for (let gx = offsetX; gx < this.canvas.width; gx += spacing) {
            for (let gy = offsetY; gy < this.canvas.height; gy += spacing) {
                this.ctx.beginPath();
                this.ctx.arc(gx, gy, 0.8 * Math.min(1.5, scale), 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    getMouseInWorldSpace(mouseX, mouseY) {
      return {
        x: (mouseX - this.transform.x) / this.transform.scale,
        y: (mouseY - this.transform.y) / this.transform.scale
      };
    }
}
