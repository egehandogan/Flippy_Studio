import { ColorPicker } from './color_picker.js';

/**
 * Properties Panel — Figma Fidelity
 * Provides professional property controls for assets and canvas.
 */
export class PropertiesPanel {
    constructor(containerSelector, sceneGraph, onUiChange) {
        this.container  = document.querySelector(containerSelector);
        this.sceneGraph = sceneGraph;
        this.onUiChange = onUiChange;

        if (!this.container) {
            console.error('[PropertiesPanel] container not found:', containerSelector);
            return;
        }

        this.container.style.pointerEvents = 'auto';
        this.container.classList.add('properties-panel');

        // Initial shell
        this.container.innerHTML = `
            <div class="panel-header tabbed-header">
                <div class="tab active">DESIGN</div>
            </div>
            <div class="props-content" id="props-content"></div>
        `;
        this.content = this.container.querySelector('#props-content');

        this._bindAllEvents();
        this._bindScrub();
    }

    render() {
        if (!this.content) return;
        const selectedIds = Array.from(this.sceneGraph.selectedAssetIds);
        
        if (selectedIds.length === 0) {
            this._renderPageProperties();
            return;
        }

        const assetId = selectedIds[selectedIds.length - 1];
        const asset   = this.sceneGraph.assets.find(a => a.id === assetId);
        if (!asset) { this.content.innerHTML = ''; return; }

        this._renderAssetProperties(asset);
    }

    _renderPageProperties() {
        const hex = (this.sceneGraph.pageColor || '#1E1E1E').toUpperCase();
        this.content.innerHTML = `
            <div class="prop-section">
                <div class="section-header">
                    <span class="section-title">Page</span>
                </div>
                <div class="color-row">
                    <div class="color-thumb-btn" data-picker="pageColor" data-hex="${hex}" data-opacity="100"
                         style="background:${hex}"></div>
                    <div class="hex-input-wrap">
                        <input type="text" class="hex-text-input" data-prop-global="pageColor" 
                               value="${hex.replace('#','')}" maxlength="6" spellcheck="false">
                    </div>
                </div>
            </div>
            <div class="prop-divider"></div>
        `;
    }

    _renderAssetProperties(asset) {
        const f = n => Math.round(n);
        const fillHex    = this._ensureHex(asset.properties.fill);
        const strokeHex  = this._ensureHex(asset.properties.stroke);
        const fillOp     = asset.properties.fillOpacity ?? 100;
        const strokeOp   = asset.properties.strokeOpacity ?? 100;
        const fillHidden = asset.properties.fillHidden === true;
        const stHidden   = asset.properties.strokeHidden === true;

        // 1. Alignment Toolbar
        const alignHtml = `
            <div class="align-bar">
                ${['left','h-center','right','top','v-center','bottom'].map((a,i) => 
                    `<button class="icon-btn" data-action="align-${a}" title="Align ${a}">${ALIGN_ICONS[i]}</button>`
                ).join('')}
            </div>
            <div class="prop-divider"></div>
        `;

        // 2. Spatial Grid
        const spatialHtml = `
            <div class="prop-section">
                <div class="section-header">
                    <div class="prop-dropdown" style="padding:0; margin-left:-4px">
                        <span>${this._cap(asset.type)}</span>
                        <svg viewBox="0 0 16 16" width="10" height="10" style="margin-left:4px"><path d="M4 6h8l-4 5z" fill="currentColor"/></svg>
                    </div>
                </div>
                <div class="spatial-grid">
                    ${this._propField('X', 'x', f(asset.x))}
                    ${this._propField('Y', 'y', f(asset.y))}
                    ${this._propField('W', 'width', f(asset.width), 1)}
                    ${this._propField('H', 'height', f(asset.height), 1)}
                    ${this._propField('°', 'rotationDeg', f((asset.rotation||0)*180/Math.PI))}
                    ${this._propField('⌀', 'properties.cornerRadius', asset.properties.cornerRadius||0, 0)}
                </div>
            </div>
            <div class="prop-divider"></div>
        `;

        // 3. Layer Section
        const layerHtml = `
            <div class="prop-section">
                <div class="section-header">
                    <span class="section-title">Layer</span>
                </div>
                <div class="color-row" style="gap:12px">
                    <div class="prop-dropdown flex-grow" style="background:rgba(255,255,255,0.03); padding:4px 8px; border-radius:6px; font-size:11px">
                        Pass through
                    </div>
                    <div class="hex-input-wrap" style="width:50px; flex:none">
                        <input type="number" class="hex-text-input" data-prop="properties.opacity" 
                               value="${Math.round(asset.properties.opacity ?? 100)}" style="text-align:right">
                    </div>
                    <button class="icon-btn-action ${asset.visible ? 'active' : ''}" data-action="toggle-asset-visible">
                        ${asset.visible ? SVG_EYE : SVG_EYE_OFF}
                    </button>
                </div>
            </div>
            <div class="prop-divider"></div>
        `;

        // 4. Fill & Stroke (Accordions)
        const fillHtml = `
            <details class="prop-accordion" open>
                <summary>
                    <span>Fill</span>
                    <button class="icon-btn-action" data-action="add-fill">+</button>
                </summary>
                <div class="accordion-content">
                    ${asset.properties.fill !== 'transparent' ? `
                        <div class="color-row">
                            <div class="color-thumb-btn" data-picker="properties.fill" 
                                 data-hex="${fillHex}" data-opacity="${fillOp}" style="background:${fillHex}"></div>
                            <div class="hex-input-wrap">
                                <input type="text" class="hex-text-input" data-prop="properties.fill" 
                                       value="${fillHex.replace('#','')}" maxlength="6">
                            </div>
                            <input type="number" class="opacity-input" data-prop="properties.fillOpacity" value="${fillOp}">
                            <span style="font-size:10px; color:var(--text-muted); margin-left:-4px">%</span>
                            <button class="icon-btn-action ${!fillHidden ? 'active' : ''}" data-action="toggle-fill-visible">
                                ${fillHidden ? SVG_EYE_OFF : SVG_EYE}
                            </button>
                            <button class="icon-btn-action" data-action="remove-fill">−</button>
                        </div>
                    ` : `<div style="font-size:11px; color:var(--text-muted); padding:4px 0">No fill</div>`}
                </div>
            </details>
        `;

        const strokeHtml = `
            <details class="prop-accordion" ${asset.properties.stroke !== 'transparent' ? 'open' : ''}>
                <summary>
                    <span>Stroke</span>
                    <button class="icon-btn-action" data-action="add-stroke">+</button>
                </summary>
                <div class="accordion-content">
                    ${asset.properties.stroke !== 'transparent' ? `
                        <div class="color-row">
                            <div class="color-thumb-btn" data-picker="properties.stroke" 
                                 data-hex="${strokeHex}" data-opacity="${strokeOp}" style="background:${strokeHex}"></div>
                            <div class="hex-input-wrap">
                                <input type="text" class="hex-text-input" data-prop="properties.stroke" 
                                       value="${strokeHex.replace('#','')}" maxlength="6">
                            </div>
                            <input type="number" class="opacity-input" data-prop="properties.strokeOpacity" value="${strokeOp}">
                            <span style="font-size:10px; color:var(--text-muted); margin-left:-4px">%</span>
                            <button class="icon-btn-action ${!stHidden ? 'active' : ''}" data-action="toggle-stroke-visible">
                                ${stHidden ? SVG_EYE_OFF : SVG_EYE}
                            </button>
                            <button class="icon-btn-action" data-action="remove-stroke">−</button>
                        </div>
                        <div class="color-row" style="margin-top:8px">
                            <div class="hex-input-wrap" style="width:40px; flex:none">
                                <input type="number" class="hex-text-input" data-prop="properties.strokeWidth" 
                                       value="${asset.properties.strokeWidth || 1}">
                            </div>
                            <div class="prop-dropdown flex-grow" data-action="cycle-stroke-pos" 
                                 style="background:rgba(255,255,255,0.03); padding:4px 8px; border-radius:6px; font-size:11px; text-transform:capitalize">
                                ${asset.properties.strokePosition || 'inside'}
                            </div>
                        </div>
                    ` : `<div style="font-size:11px; color:var(--text-muted); padding:4px 0">No stroke</div>`}
                </div>
            </details>
        `;

        this.content.innerHTML = alignHtml + spatialHtml + layerHtml + fillHtml + strokeHtml;
    }

    _propField(label, prop, val, min) {
        return `
            <div class="prop-input-group">
                <span class="prop-label" data-scrub-for="${prop}">${label}</span>
                <input type="number" class="prop-input" data-prop="${prop}" value="${val}" ${min !== undefined ? `min="${min}"` : ''}>
            </div>
        `;
    }

    _bindScrub() {
        let scrubLabel = null, scrubInput = null, scrubStart = 0, baseVal = 0;

        this.container.addEventListener('pointerdown', (e) => {
            const lbl = e.target.closest('.prop-label[data-scrub-for]');
            if (!lbl) return;
            const grp = lbl.closest('.prop-input-group');
            const inp = grp?.querySelector('input[data-prop]');
            if (!inp) return;

            lbl.setPointerCapture(e.pointerId);
            scrubLabel = lbl; scrubInput = inp;
            scrubStart = e.clientX;
            baseVal = parseFloat(inp.value) || 0;
            e.preventDefault();
        });

        this.container.addEventListener('pointermove', (e) => {
            if (!scrubLabel) return;
            const speed = e.shiftKey ? 10 : 1;
            const delta = (e.clientX - scrubStart) * speed;
            scrubInput.value = Math.round(baseVal + delta);
            this._applyPropUpdate(scrubInput, false);
        });

        this.container.addEventListener('pointerup', () => {
            if (scrubLabel) {
                this._applyPropUpdate(scrubInput, true);
                scrubLabel = null; scrubInput = null;
            }
        });
    }

    _bindAllEvents() {
        this.container.addEventListener('click', (e) => {
            const thumb = e.target.closest('.color-thumb-btn');
            if (thumb) {
                const rect = thumb.getBoundingClientRect();
                ColorPicker.open({
                    x: rect.right + 10,
                    y: rect.top,
                    hex: thumb.dataset.hex,
                    opacity: parseInt(thumb.dataset.opacity),
                    sceneGraph: this.sceneGraph,
                    onChange: (h, o) => this._applyColor(thumb.dataset.picker, h, o)
                });
                return;
            }

            const btn = e.target.closest('[data-action]');
            if (btn) this._handleAction(btn.dataset.action);
        });

        this.container.addEventListener('input', (e) => {
            if (e.target.dataset.prop || e.target.dataset.propGlobal) {
                this._applyPropUpdate(e.target, false);
            }
        });

        this.container.addEventListener('change', (e) => {
            if (e.target.dataset.prop || e.target.dataset.propGlobal) {
                this._applyPropUpdate(e.target, true);
            }
        });
    }

    _handleAction(action) {
        const asset = this._selectedAsset();
        
        if (action.startsWith('align')) {
            this.sceneGraph.alignAssets(action);
            this.render();
            this.onUiChange(true);
            return;
        }

        if (!asset) return;

        switch (action) {
            case 'toggle-asset-visible': 
                asset.visible = !asset.visible; 
                break;
            case 'toggle-fill-visible': 
                asset.properties.fillHidden = !asset.properties.fillHidden; 
                break;
            case 'toggle-stroke-visible': 
                asset.properties.strokeHidden = !asset.properties.strokeHidden; 
                break;
            case 'add-fill': 
                asset.properties.fill = '#D9D9D9'; 
                asset.properties.fillOpacity = 100; 
                asset.properties.fillHidden = false;
                break;
            case 'remove-fill': 
                asset.properties.fill = 'transparent'; 
                break;
            case 'add-stroke': 
                asset.properties.stroke = '#000000'; 
                asset.properties.strokeWidth = 1; 
                asset.properties.strokeOpacity = 100;
                asset.properties.strokeHidden = false;
                break;
            case 'remove-stroke': 
                asset.properties.stroke = 'transparent'; 
                break;
            case 'cycle-stroke-pos':
                const p = asset.properties.strokePosition || 'inside';
                asset.properties.strokePosition = p === 'inside' ? 'center' : p === 'center' ? 'outside' : 'inside';
                break;
        }
        this.render();
        this.onUiChange(true);
    }

    _applyPropUpdate(el, saveHistory) {
        const prop = el.dataset.prop || el.dataset.propGlobal;
        let val = el.value;
        if (el.type === 'number') val = parseFloat(val) || 0;

        if (el.dataset.propGlobal) {
            this.sceneGraph[prop] = val.startsWith('#') ? val : '#' + val;
            this.onUiChange(saveHistory);
            return;
        }

        const asset = this._selectedAsset();
        if (!asset) return;

        if (prop === 'rotationDeg') {
            asset.rotation = val * Math.PI / 180;
        } else if (prop.includes('.')) {
            const [o, k] = prop.split('.');
            if (k === 'fill' || k === 'stroke') val = val.startsWith('#') ? val : '#' + val;
            asset[o][k] = val;
        } else {
            asset[prop] = val;
        }

        this.onUiChange(saveHistory);
        if (saveHistory) this.render();
    }

    _applyColor(prop, hex, opacity) {
        if (prop === 'pageColor') {
            this.sceneGraph.pageColor = hex;
        } else if (this._selectedAsset()) {
            const asset = this._selectedAsset();
            const [o, k] = prop.split('.');
            asset[o][k] = hex;
            asset[o][k + 'Opacity'] = opacity;
        }
        this.render();
        this.onUiChange(false);
    }

    _selectedAsset() {
        const ids = Array.from(this.sceneGraph.selectedAssetIds);
        return ids.length ? this.sceneGraph.assets.find(a => a.id === ids[ids.length - 1]) : null;
    }

    _ensureHex(v) { return (v && v.startsWith('#')) ? v : '#FFFFFF'; }
    _cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
}

const ALIGN_ICONS = [
    `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M3 2v12h1V2H3zm3 3h7v2H6V5zm0 4h5v2H6V9z"/></svg>`,
    `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M7 2v12h2V2H7zM3 5h10v2H3V5zm2 4h6v2H5V9z"/></svg>`,
    `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M12 2v12h1V2h-1zM3 5h8v2H3V5zm2 4h6v2H5V9z"/></svg>`,
    `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M2 3h12v1H2V3zm3 3v7h2V6H5zm4 0v5h2V6H9z"/></svg>`,
    `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M2 7h12v2H2V7zM5 3v10h2V3H5zm4 2v6h2V5H9z"/></svg>`,
    `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M2 12h12v1H2v-1zM5 4v7h2V4H5zm4 2v5h2V6H9z"/></svg>`,
];

const SVG_EYE = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const SVG_EYE_OFF = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>`;
