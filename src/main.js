import './style.css'
import { CanvasEngine } from './canvas_engine'
import { SceneGraph, FlippyAsset } from './scene_graph'
import { FloatingToolbar } from './toolbar'

const sceneGraph = new SceneGraph();
const engine = new CanvasEngine('flippy-canvas');

// History Management
class HistoryManager {
    constructor(sceneGraph, limit = 50) {
        this.sceneGraph = sceneGraph;
        this.limit = limit;
        this.undoStack = [];
        this.saveState(); // Initial state
    }

    saveState() {
        if (this.undoStack.length >= this.limit) {
            this.undoStack.shift(); // Remove oldest
        }
        this.undoStack.push(JSON.stringify(this.sceneGraph.serialize()));
    }

    undo() {
        if (this.undoStack.length > 1) { // Ensure we don't pop the last state
            this.undoStack.pop(); // Remove current state
            const previousState = this.undoStack[this.undoStack.length - 1];
            this.sceneGraph.deserialize(JSON.parse(previousState));
            this.sceneGraph.selectedAssetIds.clear(); // Clear selection on undo
        }
    }
}

class ClipboardManager {
    constructor(sceneGraph) {
        this.sceneGraph = sceneGraph;
        this.clipboard = [];
        this.pasteCount = 0;
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
        const offset = this.pasteCount * 20; // 20px offset per paste
        
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

const historyManager = new HistoryManager(sceneGraph);
const clipboardManager = new ClipboardManager(sceneGraph);

let activeTool = 'cursor';
let interactionMode = 'none'; // 'moving', 'resizing', 'rotating', 'drawing', 'marquee'
let startPos = { x: 0, y: 0 };
let currentAssetId = null;
let activeHandle = null;
let initialProps = null;

// Marquee Element
const marquee = document.createElement('div');
marquee.className = 'selection-marquee';
marquee.style.display = 'none';
document.getElementById('overlay-layer').appendChild(marquee);

// Initialize Toolbar
const toolbar = new FloatingToolbar('toolbar-container', (tool) => {
    activeTool = tool;
    if (tool === 'import') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (re) => {
                const img = new Image();
                img.src = re.target.result;
                img.onload = () => {
                    const worldPos = engine.getMouseInWorldSpace(window.innerWidth/2, window.innerHeight/2);
                    const asset = new FlippyAsset('image', worldPos.x, worldPos.y, {
                        width: img.width / 4,
                        height: img.height / 4,
                        imageElement: img,
                        src: img.src
                    });
                    sceneGraph.addAsset(asset);
                    historyManager.saveState();
                };
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }
}, (action) => {
    if (action === 'center' || action === 'reset-zoom') {
        engine.resetTransform();
    }
});

// Canvas Interaction Logic
engine.canvas.addEventListener('mousedown', (e) => {
    if (e.button !== 0 || e.altKey) return;

    const mouseX = e.clientX;
    const mouseY = e.clientY;
    startPos = { x: mouseX, y: mouseY };
    const worldStart = engine.getMouseInWorldSpace(mouseX, mouseY);
    
    // Check if clicking on an asset or handle
    const hit = sceneGraph.getAssetAt(mouseX, mouseY, engine.transform);

    if (activeTool === 'cursor') {
        if (hit) {
            const { asset, handle } = hit;
            
            if (handle === 'move') {
                if (!e.shiftKey && !sceneGraph.selectedAssetIds.has(asset.id)) {
                    sceneGraph.selectedAssetIds.clear();
                }
                sceneGraph.selectedAssetIds.add(asset.id);
                interactionMode = 'moving';
                engine.draggedAsset = asset;
                engine.dragStartOffset = { x: asset.x - worldStart.x, y: asset.y - worldStart.y };
            } else if (handle === 'rotate') {
                interactionMode = 'rotating';
                activeHandle = asset;
                const ax = asset.x * engine.transform.scale + engine.transform.x + (asset.width/2 * engine.transform.scale);
                const ay = asset.y * engine.transform.scale + engine.transform.y + (asset.height/2 * engine.transform.scale);
                initialProps = { 
                    rotation: asset.rotation, 
                    startAngle: Math.atan2(mouseY - ay, mouseX - ax) 
                };
            } else {
                interactionMode = 'resizing';
                activeHandle = { asset, handle };
                initialProps = { x: asset.x, y: asset.y, width: asset.width, height: asset.height };
                engine.dragStartOffset = { x: worldStart.x, y: worldStart.y };
            }
        } else {
            if (!e.shiftKey) sceneGraph.selectedAssetIds.clear();
            interactionMode = 'marquee';
            marquee.style.display = 'block';
            marquee.style.left = `${mouseX}px`;
            marquee.style.top = `${mouseY}px`;
            marquee.style.width = '0px';
            marquee.style.height = '0px';
        }
    } else if (activeTool === 'rect' || activeTool === 'circle') {
        interactionMode = 'drawing';
        const asset = new FlippyAsset(activeTool, worldStart.x, worldStart.y, { width: 1, height: 1 });
        currentAssetId = sceneGraph.addAsset(asset);
    } else if (activeTool === 'comment') {
        const comment = document.createElement('div');
        comment.className = 'flippy-comment';
        comment.contentEditable = true;
        comment.style.position = 'absolute';
        comment.style.left = `${mouseX}px`;
        comment.style.top = `${mouseY}px`;
        comment.textContent = 'New Comment...';
        document.getElementById('overlay-layer').appendChild(comment);
        comment.focus();
        comment.onblur = () => { if(!comment.textContent) comment.remove(); };
    }
});

window.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const worldPos = engine.getMouseInWorldSpace(mouseX, mouseY);
    
    // Update cursor style
    if (interactionMode === 'none') {
        const hit = sceneGraph.getAssetAt(mouseX, mouseY, engine.transform);
        if (hit && hit.handle !== 'move') {
            engine.canvas.style.cursor = hit.handle === 'rotate' ? 'crosshair' : 'nwse-resize';
        } else {
            engine.canvas.style.cursor = 'default';
        }
    }

    if (interactionMode === 'moving' && engine.draggedAsset) {
        const asset = engine.draggedAsset;
        let nx = worldPos.x + engine.dragStartOffset.x;
        let ny = worldPos.y + engine.dragStartOffset.y;

        if (e.shiftKey) {
            const worldStart = engine.getMouseInWorldSpace(startPos.x, startPos.y);
            const dx = Math.abs(nx - worldStart.x);
            const dy = Math.abs(ny - worldStart.y);
            if (dx > dy) ny = worldStart.y + engine.dragStartOffset.y;
            else nx = worldStart.x + engine.dragStartOffset.x;
        }
        asset.x = nx;
        asset.y = ny;
    } else if (interactionMode === 'drawing' && currentAssetId) {
        const asset = sceneGraph.assets.find(a => a.id === currentAssetId);
        const worldStart = engine.getMouseInWorldSpace(startPos.x, startPos.y);
        let dx = worldPos.x - worldStart.x;
        let dy = worldPos.y - worldStart.y;
        
        if (e.shiftKey) {
            const s = Math.max(Math.abs(dx), Math.abs(dy));
            dx = Math.sign(dx) * s; dy = Math.sign(dy) * s;
        }
        asset.width = Math.max(1, Math.abs(dx));
        asset.height = Math.max(1, Math.abs(dy));
        asset.x = dx > 0 ? worldStart.x : worldStart.x + dx;
        asset.y = dy > 0 ? worldStart.y : worldStart.y + dy;
    } else if (interactionMode === 'resizing' && activeHandle) {
        const { asset, handle } = activeHandle;
        const dx = worldPos.x - engine.dragStartOffset.x;
        const dy = worldPos.y - engine.dragStartOffset.y;
        
        if (handle === 'br') {
            asset.width = Math.max(5, initialProps.width + dx);
            asset.height = Math.max(5, initialProps.height + dy);
        } else if (handle === 'tl') {
            asset.x = initialProps.x + dx;
            asset.y = initialProps.y + dy;
            asset.width = Math.max(5, initialProps.width - dx);
            asset.height = Math.max(5, initialProps.height - dy);
        } else if (handle === 'tr') {
            asset.y = initialProps.y + dy;
            asset.width = Math.max(5, initialProps.width + dx);
            asset.height = Math.max(5, initialProps.height - dy);
        } else if (handle === 'bl') {
            asset.x = initialProps.x + dx;
            asset.width = Math.max(5, initialProps.width - dx);
            asset.height = Math.max(5, initialProps.height + dy);
        }
    } else if (interactionMode === 'rotating' && activeHandle) {
        const asset = activeHandle;
        const ax = asset.x * engine.transform.scale + engine.transform.x + (asset.width/2 * engine.transform.scale);
        const ay = asset.y * engine.transform.scale + engine.transform.y + (asset.height/2 * engine.transform.scale);
        const currentAngle = Math.atan2(mouseY - ay, mouseX - ax);
        let rotation = initialProps.rotation + (currentAngle - initialProps.startAngle);
        
        if (e.shiftKey) {
            const deg = rotation * (180/Math.PI);
            rotation = (Math.round(deg / 5) * 5) * (Math.PI/180);
        }
        asset.rotation = rotation;
    } else if (interactionMode === 'marquee') {
        const x = Math.min(mouseX, startPos.x);
        const y = Math.min(mouseY, startPos.y);
        const w = Math.abs(mouseX - startPos.x);
        const h = Math.abs(mouseY - startPos.y);
        marquee.style.left = `${x}px`;
        marquee.style.top = `${y}px`;
        marquee.style.width = `${w}px`;
        marquee.style.height = `${h}px`;
        
        const inRect = sceneGraph.getAssetsInRect(x, y, x + w, y + h, engine.transform);
        sceneGraph.selectedAssetIds.clear();
        inRect.forEach(a => sceneGraph.selectedAssetIds.add(a.id));
    }
});

window.addEventListener('mouseup', () => {
    // Only save state if something actually changed (a drag, drawing, etc)
    const isActivity = interactionMode !== 'none' && interactionMode !== 'marquee';
    const isNewDraw = interactionMode === 'drawing';

    if (isActivity) {
        historyManager.saveState();
    }
    if (isNewDraw) {
        toolbar.setActiveTool('cursor');
    }
    
    interactionMode = 'none';
    currentAssetId = null;
    engine.draggedAsset = null;
    activeHandle = null;
    marquee.style.display = 'none';
});

// Global Shortcuts
window.addEventListener('keydown', (e) => {
    const key = e.key;
    const toolKey = key.toLowerCase();
    
    // Ignore if typing in an input/textarea
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.isContentEditable) {
        if (key === 'Escape') document.activeElement.blur();
        return;
    }

    // Ctrl Shortcuts
    if (e.ctrlKey) {
        if (toolKey === 'c') clipboardManager.copy();
        else if (toolKey === 'v') {
            clipboardManager.paste();
            historyManager.saveState();
        }
        else if (toolKey === 'z') historyManager.undo();
        return; 
    }

    // Delete handling
    if (key === 'Delete' || key === 'Backspace') {
        if (sceneGraph.selectedAssetIds.size > 0) {
            sceneGraph.selectedAssetIds.forEach(id => sceneGraph.removeAsset(id));
            sceneGraph.selectedAssetIds.clear();
            historyManager.saveState();
        }
    }

    if (key === 'Escape') {
        toolbar.setActiveTool('cursor');
        sceneGraph.selectedAssetIds.clear();
        return;
    }

    const toolMap = {
        'v': 'cursor', 'r': 'rect', 'o': 'circle', 't': 'text', 'p': 'pen', 'c': 'comment', 'i': 'import', 'a': 'ai', 'x': 'center'
    };

    if (toolMap[toolKey]) {
        if (toolKey === 'x') engine.resetTransform();
        else toolbar.setActiveTool(toolMap[toolKey]);
        e.preventDefault();
    }
});

engine.resetTransform();
engine.draw(sceneGraph);
