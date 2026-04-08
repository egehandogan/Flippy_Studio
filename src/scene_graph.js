/**
 * Flippy Studio - Scene Graph & Asset Definition
 * Each object on the canvas is a FlippyAsset.
 */

export class FlippyAsset {
    constructor(type, x, y, properties = {}) {
        this.id = crypto.randomUUID();
        this.type = type; // 'rect', 'circle', 'text', 'line', 'image'
        this.x = x;
        this.y = y;
        this.width = properties.width || 100;
        this.height = properties.height || 100;
        this.scale = properties.scale || { x: 1, y: 1 };
        this.rotation = properties.rotation || 0;
        this.name = properties.name || `${type.charAt(0).toUpperCase() + type.slice(1)} ${Math.floor(Math.random() * 1000)}`;
        this.layerType = properties.layerType || 'basic'; // 'frame', 'component', 'group', 'autolayout', 'basic'
        this.visible = properties.visible !== undefined ? properties.visible : true;
        this.locked = properties.locked || false;
        this.parentId = properties.parentId || null;
        
        this.properties = {
            fill: properties.fill || (type === 'frame' ? '#FFFFFF' : '#FFFFFF'),
            fillOpacity: properties.fillOpacity !== undefined ? properties.fillOpacity : 100,
            stroke: properties.stroke || (type === 'frame' ? 'transparent' : '#0094FF'),
            strokeWidth: properties.strokeWidth || 1,
            strokeOpacity: properties.strokeOpacity !== undefined ? properties.strokeOpacity : 100,
            strokePosition: properties.strokePosition || 'inside', // 'inside', 'center', 'outside'
            content: properties.content || '',
            src: properties.src || null,
            clipContent: properties.clipContent !== undefined ? properties.clipContent : (type === 'frame' ? true : false),
            ...properties
        };
        
        // Metadata for Engine Export (Unity/Unreal)
        this.engineMetadata = {
            unityTag: 'Untagged',
            unrealLayer: 'Default',
            physicsEnabled: false
        };
    }

    render(ctx, transform, sceneGraph) {
        ctx.save();
        
        const scale = transform.scale;
        const tw = this.width * scale * this.scale.x;
        const th = this.height * scale * this.scale.y;
        
        // Pivot around Center
        const cx = (this.x * scale + transform.x) + tw/2;
        const cy = (this.y * scale + transform.y) + th/2;
        
        ctx.translate(cx, cy);
        ctx.rotate(this.rotation);
        
        // Draw from top-left (relative to center)
        const rx = -tw/2;
        const ry = -th/2;

        switch (this.type) {
            case 'frame':
            case 'rect':
                ctx.fillStyle = this.properties.fill;
                ctx.beginPath();
                ctx.rect(rx, ry, tw, th);
                ctx.globalAlpha = (this.properties.fillOpacity !== undefined ? this.properties.fillOpacity : 100) / 100;
                ctx.fill();
                ctx.globalAlpha = 1.0;
                
                if (this.properties.strokeWidth && this.properties.stroke !== 'transparent') {
                    ctx.strokeStyle = this.properties.stroke;
                    ctx.lineWidth = this.properties.strokeWidth;
                    ctx.globalAlpha = (this.properties.strokeOpacity !== undefined ? this.properties.strokeOpacity : 100) / 100;
                    
                    const pos = this.properties.strokePosition || 'inside';
                    ctx.beginPath();
                    if (pos === 'inside') {
                         const i = this.properties.strokeWidth / 2;
                         ctx.rect(rx + i, ry + i, tw - i * 2, th - i * 2);
                    } else if (pos === 'outside') {
                         const o = this.properties.strokeWidth / 2;
                         ctx.rect(rx - o, ry - o, tw + o * 2, th + o * 2);
                    } else { // center
                         ctx.rect(rx, ry, tw, th);
                    }
                    ctx.stroke();
                }
                ctx.globalAlpha = 1.0;
                
                if (this.type === 'frame') {
                    // Draw Frame Name
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.font = `${12 * scale}px Inter`;
                    ctx.textAlign = 'left';
                    ctx.fillText(this.name, rx, ry - (6 * scale));
                }
                break;
            case 'circle':
                ctx.fillStyle = this.properties.fill;
                ctx.strokeStyle = this.properties.stroke;
                ctx.lineWidth = this.properties.strokeWidth;
                ctx.beginPath();
                ctx.arc(0, 0, Math.min(tw, th)/2, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                break;
            case 'image':
                if (this.properties.imageElement) {
                    ctx.drawImage(this.properties.imageElement, rx, ry, tw, th);
                }
                break;
            case 'text':
                ctx.fillStyle = '#FFFFFF';
                // Adjust text size by transform.scale
                ctx.font = `${(this.properties.fontSize || 16) * scale}px Inter`;
                ctx.fillText(this.properties.content, rx, ry + (this.properties.fontSize || 16) * scale);
                break;
        }

        ctx.restore();

        // Draw children recursive
        if (sceneGraph) {
            const children = sceneGraph.assets.filter(a => a.parentId === this.id);
            if (children.length > 0) {
                ctx.save();
                if (this.type === 'frame' && this.properties.clipContent) {
                     ctx.translate(cx, cy);
                     ctx.rotate(this.rotation);
                     ctx.beginPath();
                     ctx.rect(rx, ry, tw, th);
                     ctx.clip(); 
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

        // If selected, draw bounding box and handles
        if (transform.isSelected) {
            this.drawSelectionUI(ctx, transform);
        }
    }

    drawSelectionUI(ctx, transform) {
        ctx.save();
        const { x, y, scale } = transform;
        const tw = this.width * scale * this.scale.x;
        const th = this.height * scale * this.scale.y;

        const cx = (this.x * scale + x) + tw/2;
        const cy = (this.y * scale + y) + th/2;

        ctx.translate(cx, cy);
        ctx.rotate(this.rotation);

        const rx = -tw/2;
        const ry = -th/2;

        // Bounding Box
        ctx.strokeStyle = '#0094FF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(rx, ry, tw, th);
        ctx.stroke();

        // Handles (8x8 squares) at corners
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#0094FF';
        const hs = 8;
        const corners = [
            [rx, ry], [rx+tw, ry], [rx, ry+th], [rx+tw, ry+th]
        ];

        corners.forEach(([cpx, cpy]) => {
            ctx.beginPath();
            ctx.rect(cpx - hs/2, cpy - hs/2, hs, hs);
            ctx.fill();
            ctx.stroke();
        });

        ctx.restore();
    }

    getHandleAt(mouseX, mouseY, transform) {
        const { x, y, scale } = transform;
        const tw = this.width * scale * this.scale.x;
        const th = this.height * scale * this.scale.y;

        const cx = (this.x * scale + x) + tw/2;
        const cy = (this.y * scale + y) + th/2;

        // Convert mouse position to local space relative to center
        const dx = mouseX - cx;
        const dy = mouseY - cy;
        const cos = Math.cos(-this.rotation);
        const sin = Math.sin(-this.rotation);
        const lx = dx * cos - dy * sin;
        const ly = dx * sin + dy * cos;

        const rx = -tw/2;
        const ry = -th/2;

        const hs = 12; // Hit area
        if (Math.abs(lx - rx) <= hs && Math.abs(ly - ry) <= hs) return 'tl';
        if (Math.abs(lx - (rx+tw)) <= hs && Math.abs(ly - ry) <= hs) return 'tr';
        if (Math.abs(lx - rx) <= hs && Math.abs(ly - (ry+th)) <= hs) return 'bl';
        if (Math.abs(lx - (rx+tw)) <= hs && Math.abs(ly - (ry+th)) <= hs) return 'br';

        // Rotate check: near corners but strictly outside the bounding box
        const isInsideRect = lx >= rx && lx <= rx + tw && ly >= ry && ly <= ry + th;
        if (!isInsideRect) {
            const corners = [
                { cx: rx, cy: ry },              // TL
                { cx: rx + tw, cy: ry },         // TR
                { cx: rx, cy: ry + th },         // BL
                { cx: rx + tw, cy: ry + th }     // BR
            ];
            for (let i = 0; i < corners.length; i++) {
                const c = corners[i];
                const dist = Math.sqrt(Math.pow(lx - c.cx, 2) + Math.pow(ly - c.cy, 2));
                if (dist <= 40) return 'rotate';
            }
        }

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

    static deserialize(data) {
        const asset = new FlippyAsset(data.type, data.x, data.y, data.properties);
        asset.id = data.id;
        asset.width = data.width;
        asset.height = data.height;
        asset.scale = { ...data.scale };
        asset.rotation = data.rotation;
        asset.engineMetadata = { ...data.engineMetadata };
        asset.name = data.name;
        asset.layerType = data.layerType;
        asset.visible = data.visible;
        asset.locked = data.locked;
        asset.parentId = data.parentId;
        return asset;
    }

    clone(newId = true, offset = 0) {
        const data = this.serialize();
        if (newId) data.id = crypto.randomUUID();
        data.x += offset;
        data.y += offset;
        return FlippyAsset.deserialize(data);
    }
}

export class SceneGraph {
    constructor() {
        this.assets = [];
        this.selectedAssetIds = new Set();
    }

    addAsset(asset) {
        this.assets.push(asset);
        return asset.id;
    }

    removeAsset(id) {
        this.assets = this.assets.filter(a => a.id !== id && a.parentId !== id); // Also remove children basically
    }

    reorderAsset(id, newIndex) {
        const index = this.assets.findIndex(a => a.id === id);
        if (index > -1) {
            const [asset] = this.assets.splice(index, 1);
            this.assets.splice(newIndex, 0, asset);
        }
    }

    getAssetAt(x, y, transform) {
        // Simple hit detection (reverse order for top-most)
        for (let i = this.assets.length - 1; i >= 0; i--) {
            const asset = this.assets[i];
            if (!asset.visible || asset.locked) continue;
            
            // Check handles first
            const handle = asset.getHandleAt(x, y, transform);
            if (handle) return { asset, handle };

            const scale = transform.scale;
            const tw = asset.width * scale * asset.scale.x;
            const th = asset.height * scale * asset.scale.y;
            const cx = (asset.x * scale + transform.x) + tw/2;
            const cy = (asset.y * scale + transform.y) + th/2;

            // Simple hit test for rotated rectangle: rotate mouse into local space
            const dx = x - cx;
            const dy = y - cy;
            const cos = Math.cos(-asset.rotation);
            const sin = Math.sin(-asset.rotation);
            const lx = dx * cos - dy * sin;
            const ly = dx * sin + dy * cos;

            if (lx >= -tw/2 && lx <= tw/2 && ly >= -th/2 && ly <= th/2) {
                return { asset, handle: 'move' };
            }
        }
        return null;
    }

    getAssetsInRect(x1, y1, x2, y2, transform) {
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
            
            // Center point check for marquee (simpler)
            const acx = ax + aw/2;
            const acy = ay + ah/2;
            return acx >= minX && acx <= maxX && acy >= minY && acy <= maxY;
        });
    }

    serialize() {
        return this.assets.map(a => a.serialize());
    }

    deserialize(data) {
        this.assets = data.map(d => FlippyAsset.deserialize(d));
    }
}
