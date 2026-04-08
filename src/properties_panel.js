export class PropertiesPanel {
    constructor(containerSelector, sceneGraph, onUiChange) {
        this.container = document.querySelector(containerSelector);
        this.sceneGraph = sceneGraph;
        this.onUiChange = onUiChange;
        
        this.container.innerHTML = `
            <div class="panel-header flex-between">
                <span>Design</span>
            </div>
            <div class="props-content" id="props-content"></div>
        `;
        this.content = document.getElementById('props-content');
        
        this.bindEvents();
    }

    render() {
        const selectedIds = Array.from(this.sceneGraph.selectedAssetIds);
        if (selectedIds.length === 0) {
            this.content.innerHTML = `<div class="empty-state">No selection</div>`;
            return;
        }

        const assetId = selectedIds[selectedIds.length - 1]; // Take the most recently selected
        const asset = this.sceneGraph.assets.find(a => a.id === assetId);
        if (!asset) return;

        const f = (n) => Math.round(n);
        const fillHex = this.ensureHex(asset.properties.fill);
        const strokeHex = this.ensureHex(asset.properties.stroke);
        const hasStroke = asset.properties.stroke !== 'transparent' && asset.properties.strokeWidth > 0;

        // Visual Alignment Bar
        const alignHtml = `
            <div class="prop-section align-bar">
                <button class="icon-btn tooltip" data-action="align-left" title="Align left">
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M3 2v12h1V2H3zm3 3h7v2H6V5zm0 4h5v2H6V9z"/></svg>
                </button>
                <button class="icon-btn tooltip" data-action="align-h-center" title="Align horizontal centers">
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M7 2v12h2V2H7zM3 5h10v2H3V5zm2 4h6v2H5V9z"/></svg>
                </button>
                <button class="icon-btn tooltip" data-action="align-right" title="Align right">
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M12 2v12h1V2h-1zM3 5h8v2H3V5zm2 4h6v2H5V9z"/></svg>
                </button>
                <button class="icon-btn tooltip" data-action="align-top" title="Align top">
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2 3h12v1H2V3zm3 3v7h2V6H5zm4 0v5h2V6H9z"/></svg>
                </button>
                <button class="icon-btn tooltip" data-action="align-v-center" title="Align vertical centers">
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2 7h12v2H2V7zM5 3v10h2V3H5zm4 2v6h2V5H9z"/></svg>
                </button>
                <button class="icon-btn tooltip" data-action="align-bottom" title="Align bottom">
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2 12h12v1H2v-1zM5 4v7h2V4H5zm4 2v5h2V6H9z"/></svg>
                </button>
            </div>
            <div class="prop-divider"></div>
        `;

        // Spatial inputs matching X/Y/W/H from the image
        const spatialHtml = `
            <div class="prop-section">
                <div class="flex-between top-row mb-12">
                    <div class="prop-dropdown">
                        <span>${this.capitalize(asset.type)}</span>
                        <svg viewBox="0 0 16 16" width="12" height="12"><path d="M4 6h8l-4 5z" fill="currentColor"/></svg>
                    </div>
                </div>
                <div class="grid-2x2 spatial-grid">
                    <div class="prop-input-group">
                        <span class="prop-label">X</span>
                        <input type="number" class="prop-input" data-prop="x" value="${f(asset.x)}">
                    </div>
                    <div class="prop-input-group">
                        <span class="prop-label">Y</span>
                        <input type="number" class="prop-input" data-prop="y" value="${f(asset.y)}">
                    </div>
                    <div class="prop-input-group">
                        <span class="prop-label">W</span>
                        <input type="number" class="prop-input" data-prop="width" value="${f(asset.width)}" min="1">
                    </div>
                    <div class="prop-input-group">
                        <span class="prop-label">H</span>
                        <input type="number" class="prop-input" data-prop="height" value="${f(asset.height)}" min="1">
                    </div>
                </div>
            </div>
            <div class="prop-divider"></div>
        `;

        // Constraints Placeholder (Visual only, to match UI explicitly)
        const constraintsHtml = `
            <div class="prop-section">
                <div class="section-title mb-8">Constraints</div>
                <div class="flex-row gap-16">
                    <div class="constraints-box">
                        <div class="constraints-grid">
                            <span></span><span class="c-line top"></span><span></span>
                            <span class="c-line left"></span><span class="c-center">+</span><span class="c-line right"></span>
                            <span></span><span class="c-line bottom"></span><span></span>
                        </div>
                    </div>
                    <div class="flex-col gap-8">
                        <div class="prop-dropdown dark-dropdown"><span style="font-size:10px;">├ Right</span></div>
                        <div class="prop-dropdown dark-dropdown"><span style="font-size:10px;">┬ Top</span></div>
                    </div>
                </div>
            </div>
            <div class="prop-divider"></div>
        `;

        // Layer (Blend & Opacity)
        const layerHtml = `
            <div class="prop-section">
                <div class="section-title mb-8">Layer</div>
                <div class="flex-between">
                    <div class="prop-dropdown flex-grow mr-8">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor"><circle cx="8" cy="8" r="6"/><path d="M8 2 C12 8 8 14 8 14" fill="currentColor"/></svg>
                        <span style="margin-left: 6px;">Pass through</span>
                    </div>
                    <div class="prop-input-group small" style="width: 45px;">
                        <input type="text" class="prop-input" value="100%" disabled>
                    </div>
                    <button class="icon-btn tooltip sm" data-action="toggle-visible" title="Toggle visibility">
                         ${asset.visible ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>` : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8V20c-7 0-11-8-11-8"/></svg>`}
                    </button>
                </div>
            </div>
            <div class="prop-divider"></div>
        `;

        // Text settings if applicable
        let textHtml = '';
        if (asset.type === 'text') {
            textHtml = `
            <div class="prop-section">
                <div class="flex-between section-title-row mb-8">
                    <span class="section-title">Text</span>
                </div>
                <div class="prop-dropdown full-width mb-8">
                    <span>${asset.properties.fontFamily || 'Inter'}</span>
                    <svg viewBox="0 0 16 16" width="12" height="12"><path d="M4 6h8l-4 5z" fill="currentColor"/></svg>
                </div>
                <div class="flex-between mb-8 gap-8">
                    <div class="prop-dropdown half-width">
                        <span>Semibold</span>
                    </div>
                    <div class="prop-input-group half-width" style="padding-left: 8px;">
                        <input type="number" class="prop-input" data-prop="properties.fontSize" value="${asset.properties.fontSize || 16}">
                    </div>
                </div>
                <div class="prop-input-group full-width">
                     <span class="prop-label">A</span>
                     <input type="text" class="prop-input" data-prop="properties.content" value="${asset.properties.content}">
                </div>
            </div>
            <div class="prop-divider"></div>
            `;
        }

        // Fill Block
        const fillHtml = `
            <div class="prop-section">
                <div class="flex-between section-title-row mb-8">
                    <span class="section-title">Fill</span>
                    <div class="actions">
                        <button class="icon-btn text-like">+</button>
                    </div>
                </div>
                <div class="flex-between fill-row">
                    <div class="color-swatch-wrapper">
                        <div class="color-swatch" style="background-color: ${fillHex}"></div>
                        <input type="color" class="color-picker-input" data-prop="properties.fill" value="${fillHex}">
                    </div>
                    <input type="text" class="prop-input hex-input" data-prop="properties.fill" value="${fillHex.toUpperCase().replace('#', '')}">
                    <input type="number" class="prop-input small-pct" data-prop="properties.fillOpacity" value="${asset.properties.fillOpacity !== undefined ? asset.properties.fillOpacity : 100}" min="0" max="100">
                    <span style="font-size:10px; color:rgba(255,255,255,0.4);">%</span>
                    <button class="icon-btn text-like">-</button>
                </div>
            </div>
            <div class="prop-divider"></div>
        `;

        // Stroke Block
        const strokeHtml = `
            <div class="prop-section">
                <div class="flex-between section-title-row mb-8">
                    <span class="section-title">Stroke</span>
                    <div class="actions">
                        <button class="icon-btn text-like" data-action="add-stroke">+</button>
                    </div>
                </div>
                ${hasStroke ? `
                <div class="flex-between fill-row mb-8">
                    <div class="color-swatch-wrapper">
                        <div class="color-swatch" style="background-color: ${strokeHex}"></div>
                        <input type="color" class="color-picker-input" data-prop="properties.stroke" value="${strokeHex}">
                    </div>
                    <input type="text" class="prop-input hex-input" data-prop="properties.stroke" value="${strokeHex.toUpperCase().replace('#', '')}">
                    <input type="number" class="prop-input small-pct" data-prop="properties.strokeOpacity" value="${asset.properties.strokeOpacity !== undefined ? asset.properties.strokeOpacity : 100}" min="0" max="100">
                    <span style="font-size:10px; color:rgba(255,255,255,0.4);">%</span>
                    <button class="icon-btn text-like" data-action="remove-stroke">-</button>
                </div>
                <div class="flex-row">
                    <div class="prop-input-group small" style="width: 40px;">
                        <input type="number" class="prop-input" data-prop="properties.strokeWidth" value="${asset.properties.strokeWidth}">
                    </div>
                    <div class="prop-dropdown dark-dropdown flex-grow ml-8" data-action="cycle-stroke-pos">
                         <span style="font-size:10px; text-transform:capitalize;">${asset.properties.strokePosition || 'inside'}</span>
                    </div>
                </div>` : ''}
            </div>
            <div class="prop-divider"></div>
        `;

        // Extracs placeholders
        const extrasHtml = `
            <div class="prop-section">
                <div class="flex-between section-title-row">
                    <span class="section-title">Effects</span>
                    <div class="actions">
                        <button class="icon-btn text-like">+</button>
                    </div>
                </div>
            </div>
            <div class="prop-divider"></div>
            <div class="prop-section">
                <div class="flex-between section-title-row">
                    <span class="section-title">Export</span>
                    <div class="actions">
                        <button class="icon-btn text-like">+</button>
                    </div>
                </div>
            </div>
            <div class="prop-divider"></div>
        `;

        this.content.innerHTML = alignHtml + spatialHtml + constraintsHtml + layerHtml + textHtml + fillHtml + strokeHtml + extrasHtml;
    }

    bindEvents() {
        // Form Inputs logic
        this.container.addEventListener('change', (e) => {
            if (e.target.matches('[data-prop]')) {
                this.updateAssetFromInput(e.target);
            }
        });

        // Keyup for arrow up/down inside input numbers or direct entering without blur
        this.container.addEventListener('keydown', (e) => {
            if (e.target.matches('[data-prop]') && e.key === 'Enter') {
                this.updateAssetFromInput(e.target);
                e.target.blur();
            }
        });

        this.container.addEventListener('input', (e) => {
            // Colors update continuously on sliding
            if (e.target.matches('input[type="color"][data-prop]')) {
                this.updateAssetFromInput(e.target, false); // Don't save history on every drag frame
            }
        });

        // Buttons
        this.container.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            
            const selectedIds = Array.from(this.sceneGraph.selectedAssetIds);
            if (selectedIds.length === 0) return;
            const asset = this.sceneGraph.assets.find(a => a.id === selectedIds[selectedIds.length - 1]);
            
            if (action === 'toggle-visible') {
                asset.visible = !asset.visible;
                this.render();
                this.onUiChange(true);
            } else if (action === 'add-stroke') {
                asset.properties.stroke = '#000000';
                asset.properties.strokeWidth = 1;
                this.render();
                this.onUiChange(true);
            } else if (action === 'remove-stroke') {
                asset.properties.stroke = 'transparent';
                this.render();
                this.onUiChange(true);
            } else if (action === 'cycle-stroke-pos') {
                const pos = asset.properties.strokePosition || 'inside';
                if (pos === 'inside') asset.properties.strokePosition = 'center';
                else if (pos === 'center') asset.properties.strokePosition = 'outside';
                else asset.properties.strokePosition = 'inside';
                this.render();
                this.onUiChange(true);
            }
            // Alignments left as mock for visual layout matching plan unless instructed to implement mathematical alignment
        });
    }

    updateAssetFromInput(inputEl, saveHistory = true) {
        const propPath = inputEl.dataset.prop;
        let value = inputEl.value;

        if (inputEl.type === 'number') {
            value = parseFloat(value) || 0;
        }

        if (inputEl.classList.contains('hex-input')) {
            value = '#' + value.replace('#', '');
        }

        const selectedIds = Array.from(this.sceneGraph.selectedAssetIds);
        if (selectedIds.length === 0) return;

        selectedIds.forEach(id => {
            const asset = this.sceneGraph.assets.find(a => a.id === id);
            if (!asset) return;

            // Handle nested properties (e.g. properties.fill)
            if (propPath.includes('.')) {
                const keys = propPath.split('.');
                asset[keys[0]][keys[1]] = value;
            } else {
                asset[propPath] = value;
            }
        });

        if (saveHistory) {
            this.onUiChange(true);
        } else {
            this.onUiChange(false);
        }

        // Re-render to format text correctly (e.g. Hex adding #) if we blurred
        if (saveHistory) this.render();
    }

    ensureHex(val) {
        if (!val || val === 'transparent') return '#000000';
        return val;
    }

    capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
}
