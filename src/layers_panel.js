export class LayersPanel {
    constructor(containerSelector, sceneGraph, onUiChange) {
        this.container  = document.querySelector(containerSelector);
        this.sceneGraph = sceneGraph;
        this.onUiChange = onUiChange;
        this._collapsed = new Set(); // IDs of collapsed frame/group nodes
        this._renaming  = null;     // ID being renamed

        this.container.innerHTML = `
            <div class="panel-header flex-between">
                <div class="search-box">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
                    <input type="text" placeholder="Layers" class="layer-search" id="layer-search-input"/>
                </div>
                <span class="header-actions">
                    <button class="icon-btn-sm" id="add-layer-btn" title="Add rectangle">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                </span>
            </div>
            <div class="layers-list" id="layers-list"></div>
        `;

        this.list      = this.container.querySelector('#layers-list');
        this._dragId   = null;
        this._dropTarget = null;
        this._dropMode   = null; // 'before' | 'after' | 'into'

        this._bindEvents();
    }

    // ── Render ─────────────────────────────────────────────────────────────
    render(filterText = '') {
        this.list.innerHTML = '';
        const filter   = filterText.toLowerCase().trim();
        // Front-to-back = reversed scene array
        const roots    = [...this.sceneGraph.assets].filter(a => !a.parentId).reverse();
        roots.forEach(a => this._renderNode(a, 0, filter));
    }

    _renderNode(asset, depth, filter) {
        const hasChildren = this.sceneGraph.assets.some(a => a.parentId === asset.id);
        const collapsed   = this._collapsed.has(asset.id);
        const isSelected  = this.sceneGraph.selectedAssetIds.has(asset.id);

        // Filter matching
        if (filter && !asset.name.toLowerCase().includes(filter)) {
            // Still recurse for children that might match
            if (!collapsed && hasChildren) {
                const children = this.sceneGraph.assets.filter(a => a.parentId === asset.id).reverse();
                children.forEach(c => this._renderNode(c, depth + 1, filter));
            }
            return;
        }

        const item = document.createElement('div');
        item.className = `layer-item layer-type-${asset.layerType || 'basic'} ${isSelected ? 'selected' : ''}`;
        item.dataset.id    = asset.id;
        item.dataset.depth = depth;
        item.draggable     = true;

        const paddingLeft = 8 + depth * 16;

        item.innerHTML = `
        <div class="layer-content" style="padding-left:${paddingLeft}px">
            <button class="layer-collapse-btn ${hasChildren ? '' : 'invisible'}" data-action="collapse" title="Expand/Collapse">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                    style="transform:rotate(${collapsed ? '-90deg' : '0deg'});transition:transform .15s ease">
                    <path d="M6 9l6 6 6-6"/>
                </svg>
            </button>
            <span class="layer-icon">${this._getIcon(asset)}</span>
            <span class="layer-name" data-action="select" title="${asset.name}">${asset.name}</span>
        </div>
        <div class="layer-actions">
            <button class="layer-lock ${asset.locked ? 'active' : ''}" data-action="lock" title="${asset.locked ? 'Unlock' : 'Lock'}">
                ${asset.locked ? ICON_LOCK : ICON_LOCK_OPEN}
            </button>
            <button class="layer-visible ${!asset.visible ? 'active' : ''}" data-action="visible" title="${asset.visible ? 'Hide' : 'Show'}">
                ${asset.visible ? ICON_EYE : ICON_EYE_OFF}
            </button>
        </div>`;

        this.list.appendChild(item);

        // Render children (front-to-back order)
        if (hasChildren && !collapsed) {
            const children = this.sceneGraph.assets.filter(a => a.parentId === asset.id).reverse();
            children.forEach(c => this._renderNode(c, depth + 1, filter));
        }
    }

    _getIcon(asset) {
        switch (asset.layerType) {
            case 'frame':
                return `<svg viewBox="0 0 24 24"><path d="M4 8h16M4 16h16M8 4v16M16 4v16" stroke="currentColor" stroke-width="2" fill="none"/></svg>`;
            case 'component':
                return `<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" transform="rotate(45 12 12)" stroke="currentColor" stroke-width="2" fill="none"/></svg>`;
            case 'group':
                return `<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" stroke="currentColor" stroke-width="2.5" stroke-dasharray="4" fill="none"/></svg>`;
            case 'text':
                return `<svg viewBox="0 0 24 24"><path d="M4 7V4h16v3M9 20h6M12 4v16" stroke="currentColor" stroke-width="2" fill="none"/></svg>`;
            default:
                return `<svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="1.5" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>`;
        }
    }

    // ── Events ─────────────────────────────────────────────────────────────
    _bindEvents() {
        // Layer search
        const searchEl = this.container.querySelector('#layer-search-input');
        if (searchEl) searchEl.addEventListener('input', () => this.render(searchEl.value));

        // Click delegation
        this.list.addEventListener('click', (e) => {
            const item = e.target.closest('.layer-item');
            if (!item) return;
            const id     = item.dataset.id;
            const asset  = this.sceneGraph.assets.find(a => a.id === id);
            if (!asset) return;

            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            switch (btn.dataset.action) {
                case 'collapse': {
                    if (this._collapsed.has(id)) this._collapsed.delete(id);
                    else this._collapsed.add(id);
                    this.render();
                    break;
                }
                case 'visible': {
                    asset.visible = !asset.visible;
                    this.render();
                    this.onUiChange(false);
                    break;
                }
                case 'lock': {
                    asset.locked = !asset.locked;
                    this.render();
                    this.onUiChange(false);
                    break;
                }
                case 'select': {
                    if (!e.shiftKey) this.sceneGraph.selectedAssetIds.clear();
                    if (this.sceneGraph.selectedAssetIds.has(id)) {
                        this.sceneGraph.selectedAssetIds.delete(id);
                    } else {
                        this.sceneGraph.selectedAssetIds.add(id);
                    }
                    this.render();
                    this.onUiChange(false);
                    break;
                }
            }
        });

        // Double-click to rename
        this.list.addEventListener('dblclick', (e) => {
            const name = e.target.closest('.layer-name');
            if (!name) return;
            const item = e.target.closest('.layer-item');
            if (!item) return;
            this._startRename(item.dataset.id, name);
        });

        // Drag-and-drop for reordering + reparenting into frames
        this._bindDragDrop();
    }

    _startRename(id, nameEl) {
        const asset = this.sceneGraph.assets.find(a => a.id === id);
        if (!asset) return;

        const input = document.createElement('input');
        input.className = 'layer-rename-input';
        input.value     = asset.name;
        nameEl.replaceWith(input);
        input.focus();
        input.select();

        const commit = () => {
            const newName = input.value.trim() || asset.name;
            asset.name = newName;
            this.render();
            this.onUiChange(true);
        };
        input.addEventListener('blur', commit);
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter')  { input.blur(); }
            if (e.key === 'Escape') { asset.name = asset.name; this.render(); }
        });
    }

    // ── Drag & Drop ─────────────────────────────────────────────────────────
    _bindDragDrop() {
        // Using HTML5 drag API with visual drop indicator
        this.list.addEventListener('dragstart', (e) => {
            const item = e.target.closest('.layer-item');
            if (!item) { e.preventDefault(); return; }
            this._dragId = item.dataset.id;
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        this.list.addEventListener('dragover', (e) => {
            e.preventDefault();
            const target = e.target.closest('.layer-item');
            if (!target || target.dataset.id === this._dragId) return;

            // Remove old indicator
            this.list.querySelectorAll('.drop-indicator').forEach(el => el.remove());
            this.list.querySelectorAll('.drop-into').forEach(el => el.classList.remove('drop-into'));

            const rect   = target.getBoundingClientRect();
            const relY   = e.clientY - rect.top;
            const zone   = rect.height * 0.25;
            const tAsset = this.sceneGraph.assets.find(a => a.id === target.dataset.id);

            if (relY < zone) {
                // Drop BEFORE
                const line = document.createElement('div');
                line.className = 'drop-indicator drop-before';
                target.before(line);
                this._dropTarget = target.dataset.id;
                this._dropMode   = 'before';
            } else if (relY > rect.height - zone && tAsset && tAsset.layerType === 'frame') {
                // Drop INTO frame
                target.classList.add('drop-into');
                this._dropTarget = target.dataset.id;
                this._dropMode   = 'into';
            } else {
                // Drop AFTER
                const line = document.createElement('div');
                line.className = 'drop-indicator drop-after';
                target.after(line);
                this._dropTarget = target.dataset.id;
                this._dropMode   = 'after';
            }
        });

        this.list.addEventListener('dragleave', () => {
            this.list.querySelectorAll('.drop-indicator').forEach(el => el.remove());
            this.list.querySelectorAll('.drop-into').forEach(el => el.classList.remove('drop-into'));
        });

        this.list.addEventListener('drop', (e) => {
            e.preventDefault();
            this._applyDrop();
        });

        this.list.addEventListener('dragend', () => {
            this.list.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
            this.list.querySelectorAll('.drop-indicator').forEach(el => el.remove());
            this.list.querySelectorAll('.drop-into').forEach(el => el.classList.remove('drop-into'));
            this._dragId = null; this._dropTarget = null; this._dropMode = null;
        });
    }

    _applyDrop() {
        if (!this._dragId || !this._dropTarget || this._dragId === this._dropTarget) return;

        const sg      = this.sceneGraph;
        const dragAsset = sg.assets.find(a => a.id === this._dragId);
        const tgtAsset  = sg.assets.find(a => a.id === this._dropTarget);
        if (!dragAsset || !tgtAsset) return;

        // Prevent dropping a parent into its own child
        if (this._isDescendant(tgtAsset.id, dragAsset.id)) return;

        // Remove from current position
        sg.assets = sg.assets.filter(a => a.id !== dragAsset.id);

        if (this._dropMode === 'into') {
            // Reparent into frame
            dragAsset.parentId = tgtAsset.id;
            sg.assets.push(dragAsset);
        } else {
            // Reorder at same level (keep parentId)
            dragAsset.parentId = tgtAsset.parentId;
            const tgtIdx = sg.assets.findIndex(a => a.id === tgtAsset.id);
            // layers-list is front-to-back visually, sceneGraph is back-to-front
            // 'before' in UI = insert AFTER in sceneGraph (higher index)
            const insertIdx = this._dropMode === 'before' ? tgtIdx + 1 : tgtIdx;
            sg.assets.splice(Math.max(0, insertIdx), 0, dragAsset);
        }

        this.render();
        this.onUiChange(true);
    }

    _isDescendant(potentialChildId, ancestorId) {
        let asset = this.sceneGraph.assets.find(a => a.id === potentialChildId);
        while (asset && asset.parentId) {
            if (asset.parentId === ancestorId) return true;
            asset = this.sceneGraph.assets.find(a => a.id === asset.parentId);
        }
        return false;
    }
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const ICON_EYE     = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const ICON_EYE_OFF = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>`;
const ICON_LOCK    = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>`;
const ICON_LOCK_OPEN = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4M16 11V7"/></svg>`;
