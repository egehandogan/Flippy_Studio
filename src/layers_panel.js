export class LayersPanel {
    constructor(containerSelector, sceneGraph, onUiChange) {
        this.container = document.querySelector(containerSelector);
        this.sceneGraph = sceneGraph;
        this.onUiChange = onUiChange; 
        
        this.container.innerHTML = `
            <div class="panel-header flex-between">
                <div class="search-box">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
                    <input type="text" placeholder="Layers" class="layer-search"/>
                </div>
                <span class="header-actions">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                </span>
            </div>
            <div class="layers-list" id="layers-list"></div>
        `;
        
        this.listContainer = document.getElementById('layers-list');
        this.draggedAssetId = null;
        this.bindEvents();
    }

    render() {
        this.listContainer.innerHTML = '';
        
        // Reverse order: UI shows front-most (last in array) at the top.
        const assetsUiList = [...this.sceneGraph.assets].reverse();

        assetsUiList.forEach((asset) => {
            const item = document.createElement('div');
            item.className = `layer-item layer-type-${asset.layerType} ${this.sceneGraph.selectedAssetIds.has(asset.id) ? 'selected' : ''}`;
            item.dataset.id = asset.id;
            item.draggable = true;

            let typeIcon = '';
            if (asset.layerType === 'frame') typeIcon = `<svg viewBox="0 0 24 24"><path d="M4 8h16M4 16h16M8 4v16M16 4v16" stroke="currentColor" stroke-width="2" fill="none"/></svg>`;
            else if (asset.layerType === 'component') typeIcon = `<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" transform="rotate(45 12 12)" stroke="currentColor" stroke-width="2" fill="none"/></svg>`;
            else if (asset.layerType === 'group') typeIcon = `<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" stroke="currentColor" stroke-width="2.5" stroke-dasharray="4" fill="none"/></svg>`;
            else if (asset.layerType === 'auto-layout') typeIcon = `<svg viewBox="0 0 24 24"><path d="M8 6v12M16 6v12M12 6v12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
            else typeIcon = `<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`;
            
            const depth = this.calculateDepth(asset.id);
            const indentStyle = depth > 0 ? `padding-left: ${depth * 16}px` : '';

            // Using pure CSS visibility/opacity for hover lock/eye unless they are active
            item.innerHTML = `
                <div class="layer-content" style="${indentStyle}">
                    <span class="layer-collapse">
                        ${depth === 0 ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>` : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>`}
                    </span>
                    <span class="layer-icon">${typeIcon}</span>
                    <span class="layer-name">${asset.name}</span>
                </div>
                <div class="layer-actions">
                    <span class="layer-lock ${asset.locked ? 'active' : ''}" data-action="lock" title="Lock">
                        ${asset.locked ? 
                            `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>` : 
                            `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`}
                    </span>
                    <span class="layer-visible ${!asset.visible ? 'active' : ''}" data-action="visible" title="Toggle Visibility">
                        ${asset.visible ? 
                            `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>` :
                            `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>`
                        }
                    </span>
                </div>
            `;
            
            this.listContainer.appendChild(item);
        });
    }

    calculateDepth(id) {
        let depth = 0;
        let pId = this.sceneGraph.assets.find(a => a.id === id)?.parentId;
        while(pId) {
            depth++;
            pId = this.sceneGraph.assets.find(a => a.id === pId)?.parentId;
        }
        return depth;
    }

    bindEvents() {
        this.listContainer.addEventListener('click', (e) => {
            const item = e.target.closest('.layer-item');
            if (!item) return;

            const id = item.dataset.id;
            const asset = this.sceneGraph.assets.find(a => a.id === id);
            if (!asset) return;

            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn) {
                if (actionBtn.dataset.action === 'lock') {
                    asset.locked = !asset.locked;
                } else if (actionBtn.dataset.action === 'visible') {
                    asset.visible = !asset.visible;
                }
                this.render();
                this.onUiChange(false); // Render canvas but no history save
                return;
            }

            // Normal select
            if (!e.shiftKey) {
                this.sceneGraph.selectedAssetIds.clear();
            }
            if (this.sceneGraph.selectedAssetIds.has(id)) {
                 this.sceneGraph.selectedAssetIds.delete(id);
            } else {
                 this.sceneGraph.selectedAssetIds.add(id);
            }
            
            this.render();
            this.onUiChange(false);
        });

        // Drag & Drop for reordering
        this.listContainer.addEventListener('dragstart', (e) => {
            const item = e.target.closest('.layer-item');
            if (item) {
                this.draggedAssetId = item.dataset.id;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        this.listContainer.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necessary to allow dropping
            const draggingItem = this.listContainer.querySelector('.dragging');
            const afterElement = this.getDragAfterElement(this.listContainer, e.clientY);
            if (afterElement == null) {
                this.listContainer.appendChild(draggingItem);
            } else {
                this.listContainer.insertBefore(draggingItem, afterElement);
            }
        });

        this.listContainer.addEventListener('dragend', (e) => {
            const item = e.target.closest('.layer-item');
            if (item) {
                item.classList.remove('dragging');
                
                // Read new order from DOM
                // Since DOM lists items from Top (Front) to Bottom (Back),
                // the SceneGraph array should be reversed (Back = 0, Front = N)
                const domItems = Array.from(this.listContainer.querySelectorAll('.layer-item'));
                const newArray = [];
                for (let i = domItems.length - 1; i >= 0; i--) {
                    const id = domItems[i].dataset.id;
                    const a = this.sceneGraph.assets.find(x => x.id === id);
                    if (a) newArray.push(a);
                }
                
                if (newArray.length === this.sceneGraph.assets.length) {
                    this.sceneGraph.assets = newArray;
                    this.onUiChange(true); // Save history state
                }
                this.draggedAssetId = null;
            }
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.layer-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
}
