import { ColorPicker } from './color_picker.js';

/**
 * Properties Panel — Fully wired
 * - Color swatch click → opens color picker
 * - Hex text → editable text input (copy/paste works natively)
 * - Eye icon → toggles fill/stroke visibility (opacity 0/100)
 * - Minus button → removes fill or stroke
 * - All numeric inputs bidirectionally synced with SceneGraph
 * - Works for canvas color, selected shapes, frames
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

        // Ensure pointer-events enabled
        this.container.style.pointerEvents = 'auto';

        this.container.innerHTML = `
            <div class="panel-header tabbed-header">
                <div class="tab active">Design</div>
            </div>
            <div class="props-content" id="props-content"></div>
        `;
        this.content = this.container.querySelector('#props-content');

        this._bindAllEvents();
        this._bindScrub();
    }

    // ── Render ─────────────────────────────────────────────────────────────
    render() {
        const f = n => Math.round(n);
        const selectedIds = Array.from(this.sceneGraph.selectedAssetIds);

        if (selectedIds.length === 0) {
            // No selection → show canvas/page color
            const pageHex = this._ensureHex(this.sceneGraph.pageColor || '#1E1E1E');
            this.content.innerHTML = `
            <div class="prop-section">
                <div class="flex-between section-title-row mb-12">
                    <span class="section-title">Canvas</span>
                </div>
                <div class="color-row">
                    <div class="color-thumb-btn" data-picker="pageColor" data-hex="${pageHex}" data-opacity="100"
                         style="background:${pageHex}; border:2px solid rgba(255,255,255,0.18)">
                    </div>
                    <input type="text" class="hex-text-input" data-prop-global="pageColor"
                           value="${pageHex.replace('#','').toUpperCase()}" maxlength="6" spellcheck="false"/>
                    <span class="hex-pct-sep"></span>
                    <input type="number" class="pct-num-input" data-pct-global="pageColor"
                           value="100" min="0" max="100" disabled/>
                    <span class="pct-symbol">%</span>
                    <button class="row-eye-btn active" data-eye-global="pageColor" title="Toggle visibility">
                        ${SVG_EYE}
                    </button>
                </div>
            </div>
            <div class="prop-divider"></div>`;
            return;
        }

        const assetId = selectedIds[selectedIds.length - 1];
        const asset   = this.sceneGraph.assets.find(a => a.id === assetId);
        if (!asset) { this.content.innerHTML = ''; return; }

        const fillHex    = this._ensureHex(asset.properties.fill);
        const strokeHex  = this._ensureHex(asset.properties.stroke);
        const hasFill    = asset.properties.fill && asset.properties.fill !== 'transparent';
        const hasStroke  = asset.properties.stroke && asset.properties.stroke !== 'transparent'
                           && asset.properties.strokeWidth > 0;
        const fillOp     = asset.properties.fillOpacity   ?? 100;
        const strokeOp   = asset.properties.strokeOpacity ?? 100;
        const fillHidden = asset.properties.fillHidden === true;
        const rotDeg     = f((asset.rotation || 0) * 180 / Math.PI);
        const radius     = asset.properties.cornerRadius || 0;

        // ── Alignment bar ──────────────────────────────────────────────────
        const alignHtml = `
        <div class="prop-section align-bar">
            ${['align-left','align-h-center','align-right','align-top','align-v-center','align-bottom'].map((a,i) =>
                `<button class="icon-btn" data-action="${a}" title="${a.replace(/-/g,' ')}">${ALIGN_ICONS[i]}</button>`
            ).join('')}
        </div>
        <div class="prop-divider"></div>`;

        // ── Spatial (X/Y/W/H/rotation/radius) ─────────────────────────────
        const spatialHtml = `
        <div class="prop-section">
            <div class="flex-between top-row mb-12">
                <div class="prop-dropdown">
                    <span>${this._cap(asset.type)}</span>
                    <svg viewBox="0 0 16 16" width="10" height="10"><path d="M4 6h8l-4 5z" fill="currentColor"/></svg>
                </div>
            </div>
            <div class="spatial-grid">
                ${this._numField('X', 'x', f(asset.x))}
                ${this._numField('Y', 'y', f(asset.y))}
                ${this._numField('W', 'width', f(asset.width), 1)}
                ${this._numField('H', 'height', f(asset.height), 1)}
                ${this._numField('°', 'rotationDeg', rotDeg)}
                ${this._numField('⌀', 'properties.cornerRadius', radius, 0)}
            </div>
        </div>
        <div class="prop-divider"></div>`;

        // ── Fill ───────────────────────────────────────────────────────────
        const fillHtml = `
        <details class="prop-accordion" open>
            <summary class="flex-between section-title-row">
                <span class="section-title">Fill</span>
                <div class="actions">
                    <button class="icon-btn text-like" data-action="add-fill" title="Add fill">+</button>
                </div>
            </summary>
            <div class="accordion-content">
            ${hasFill ? `
                <div class="color-row ${fillHidden ? 'opacity-dim' : ''}">
                    <div class="color-thumb-btn" data-picker="properties.fill"
                         data-hex="${fillHex}" data-opacity="${fillOp}"
                         style="background:${fillHex}; opacity:${fillHidden?0.3:1}">
                    </div>
                    <input type="text" class="hex-text-input" data-prop="properties.fill"
                           value="${fillHex.replace('#','').toUpperCase()}" maxlength="6" spellcheck="false"/>
                    <span class="hex-pct-sep"></span>
                    <input type="number" class="pct-num-input" data-prop="properties.fillOpacity"
                           value="${Math.round(fillOp)}" min="0" max="100"/>
                    <span class="pct-symbol">%</span>
                    <button class="row-eye-btn ${fillHidden ? '' : 'active'}"
                            data-action="toggle-fill-visible" title="Toggle fill">
                        ${fillHidden ? SVG_EYE_OFF : SVG_EYE}
                    </button>
                    <button class="row-minus-btn" data-action="remove-fill" title="Remove fill">−</button>
                </div>
            ` : `<div class="color-row-empty">No fill</div>`}
            </div>
        </details>
        <div class="prop-divider" style="margin-top:8px;"></div>`;

        // ── Stroke ─────────────────────────────────────────────────────────
        const strokeHtml = `
        <details class="prop-accordion" ${hasStroke ? 'open' : ''}>
            <summary class="flex-between section-title-row">
                <span class="section-title">Stroke</span>
                <div class="actions">
                    <button class="icon-btn text-like" data-action="add-stroke" title="Add stroke">+</button>
                </div>
            </summary>
            <div class="accordion-content">
            ${hasStroke ? `
                <div class="color-row">
                    <div class="color-thumb-btn" data-picker="properties.stroke"
                         data-hex="${strokeHex}" data-opacity="${strokeOp}"
                         style="background:${strokeHex}">
                    </div>
                    <input type="text" class="hex-text-input" data-prop="properties.stroke"
                           value="${strokeHex.replace('#','').toUpperCase()}" maxlength="6" spellcheck="false"/>
                    <span class="hex-pct-sep"></span>
                    <input type="number" class="pct-num-input" data-prop="properties.strokeOpacity"
                           value="${Math.round(strokeOp)}" min="0" max="100"/>
                    <span class="pct-symbol">%</span>
                    <button class="row-eye-btn active" data-action="toggle-stroke-visible" title="Toggle stroke">
                        ${SVG_EYE}
                    </button>
                    <button class="row-minus-btn" data-action="remove-stroke" title="Remove stroke">−</button>
                </div>
                <div class="stroke-extras-row">
                    <input type="number" class="prop-input small-num" data-prop="properties.strokeWidth"
                           value="${asset.properties.strokeWidth || 1}" min="0" style="width:40px"/>
                    <button class="prop-dropdown dark-dropdown flex-grow" data-action="cycle-stroke-pos"
                            style="font-size:10px;text-transform:capitalize;padding:4px 8px">
                        ${asset.properties.strokePosition || 'inside'}
                    </button>
                </div>
            ` : `<div class="color-row-empty">No stroke</div>`}
            </div>
        </details>
        <div class="prop-divider" style="margin-top:8px;"></div>`;

        // ── Layer (opacity / blend) ─────────────────────────────────────────
        const layerHtml = `
        <div class="prop-section">
            <div class="section-title mb-8">Layer</div>
            <div class="flex-between gap-8">
                <div class="prop-dropdown flex-grow" style="font-size:11px">Pass through</div>
                <div class="prop-input-group" style="width:52px;flex-shrink:0">
                    <input type="number" class="prop-input" data-prop="properties.opacity"
                           value="${Math.round(asset.properties.opacity ?? 100)}" min="0" max="100"/>
                </div>
                <button class="icon-btn ${asset.visible ? 'active' : ''}"
                        data-action="toggle-layer-visible" title="Toggle layer">
                    ${asset.visible ? SVG_EYE : SVG_EYE_OFF}
                </button>
            </div>
        </div>
        <div class="prop-divider"></div>`;

        // ── Text (if text asset) ───────────────────────────────────────────
        let textHtml = '';
        if (asset.type === 'text') {
            textHtml = `
            <div class="prop-section">
                <div class="section-title mb-8">Text</div>
                <div class="prop-input-group full-width mb-8">
                    <span class="prop-label">A</span>
                    <input type="text" class="prop-input" data-prop="properties.content"
                           value="${(asset.properties.content || '').replace(/"/g,'&quot;')}"/>
                </div>
                <div class="flex-between gap-8">
                    <div class="prop-dropdown half-width" style="font-size:11px">
                        ${asset.properties.fontFamily || 'Inter'}
                    </div>
                    <input type="number" class="prop-input" data-prop="properties.fontSize"
                           value="${asset.properties.fontSize || 16}" style="width:50px"/>
                </div>
            </div>
            <div class="prop-divider"></div>`;
        }

        this.content.innerHTML = alignHtml + spatialHtml + layerHtml + textHtml + fillHtml + strokeHtml;
    }

    // ── DOM helper ─────────────────────────────────────────────────────────
    _numField(label, prop, val, min = undefined) {
        const minAttr = min !== undefined ? `min="${min}"` : '';
        return `
        <div class="prop-input-group">
            <span class="prop-label" data-scrub-for="${prop}">${label}</span>
            <input type="number" class="prop-input" data-prop="${prop}" value="${val}" ${minAttr}/>
        </div>`;
    }

    // ── Scrub: drag prop-label to change its sibling number input ──────────
    _bindScrub() {
        let scrubLabel = null, scrubInput = null, scrubStart = 0, baseVal = 0;

        this.container.addEventListener('pointerdown', (e) => {
            const lbl = e.target.closest('.prop-label[data-scrub-for]');
            if (!lbl) return;
            const grp = lbl.closest('.prop-input-group');
            if (!grp) return;
            const inp = grp.querySelector('input[type="number"][data-prop]');
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
            const raw   = baseVal + delta;
            const min   = scrubInput.min !== '' ? parseFloat(scrubInput.min) : -Infinity;
            const max   = scrubInput.max !== '' ? parseFloat(scrubInput.max) :  Infinity;
            scrubInput.value = Math.max(min, Math.min(max, Math.round(raw)));
            this._applyPropInput(scrubInput, false);
        });

        this.container.addEventListener('pointerup', () => {
            if (!scrubLabel) return;
            this._applyPropInput(scrubInput, true);
            scrubLabel = null; scrubInput = null;
        });
    }

    // ── All event bindings ─────────────────────────────────────────────────
    _bindAllEvents() {

        // ── Color swatch thumbnail → open picker ──────────────────────────
        this.container.addEventListener('click', (e) => {
            const thumb = e.target.closest('.color-thumb-btn');
            if (thumb) {
                e.stopPropagation();
                const rect    = thumb.getBoundingClientRect();
                const prop    = thumb.dataset.picker;
                const hex     = ('#' + (thumb.dataset.hex || 'FFFFFF').replace('#','')).toUpperCase();
                const opacity = parseInt(thumb.dataset.opacity) || 100;

                ColorPicker.open({
                    x: rect.right,
                    y: rect.top,
                    hex,
                    opacity,
                    sceneGraph: this.sceneGraph,
                    onChange: (newHex, newOp) => {
                        this._applyColor(prop, newHex, newOp);
                    }
                });
                return;
            }

            // ── Button actions ─────────────────────────────────────────────
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            const action = btn.dataset.action;
            const asset  = this._selectedAsset();

            switch (action) {
                case 'toggle-fill-visible': {
                    if (!asset) return;
                    asset.properties.fillHidden = !asset.properties.fillHidden;
                    this.render(); this.onUiChange(true);
                    break;
                }
                case 'toggle-stroke-visible': {
                    if (!asset) return;
                    asset.properties.strokeHidden = !asset.properties.strokeHidden;
                    this.render(); this.onUiChange(true);
                    break;
                }
                case 'toggle-layer-visible': {
                    if (!asset) return;
                    asset.visible = !asset.visible;
                    this.render(); this.onUiChange(true);
                    break;
                }
                case 'add-fill': {
                    if (!asset) return;
                    asset.properties.fill = '#FFFFFF';
                    asset.properties.fillOpacity = 100;
                    asset.properties.fillHidden = false;
                    this.render(); this.onUiChange(true);
                    break;
                }
                case 'remove-fill': {
                    if (!asset) return;
                    asset.properties.fill = 'transparent';
                    this.render(); this.onUiChange(true);
                    break;
                }
                case 'add-stroke': {
                    if (!asset) return;
                    asset.properties.stroke = '#000000';
                    asset.properties.strokeWidth = 1;
                    asset.properties.strokeOpacity = 100;
                    this.render(); this.onUiChange(true);
                    break;
                }
                case 'remove-stroke': {
                    if (!asset) return;
                    asset.properties.stroke = 'transparent';
                    asset.properties.strokeWidth = 0;
                    this.render(); this.onUiChange(true);
                    break;
                }
                case 'cycle-stroke-pos': {
                    if (!asset) return;
                    const p = asset.properties.strokePosition || 'inside';
                    asset.properties.strokePosition = p === 'inside' ? 'center' : p === 'center' ? 'outside' : 'inside';
                    this.render(); this.onUiChange(true);
                    break;
                }
            }
        });

        // ── Hex text input → apply color on Enter/blur ────────────────────
        this.container.addEventListener('input', (e) => {
            const el = e.target;

            // Hex text inputs
            if (el.classList.contains('hex-text-input')) {
                const raw = el.value.replace('#','').trim();
                if (raw.length !== 6) return;
                const hex = '#' + raw;
                const prop = el.dataset.prop || el.dataset.propGlobal;
                if (el.dataset.propGlobal) {
                    this.sceneGraph[el.dataset.propGlobal] = hex;
                    // update swatch
                    const thumb = el.previousElementSibling;
                    if (thumb?.classList.contains('color-thumb-btn')) {
                        thumb.style.background = hex;
                        thumb.dataset.hex = hex;
                    }
                    this.onUiChange(false);
                } else {
                    this._applyColorProp(prop, hex);
                }
                return;
            }

            // Opacity number
            if (el.classList.contains('pct-num-input') && el.dataset.prop) {
                this._applyPropInput(el, false);
                return;
            }

            // Generic number inputs
            if (el.dataset.prop && el.type === 'number') {
                this._applyPropInput(el, false);
            }
        });

        // Save history on blur for numeric/text
        this.container.addEventListener('change', (e) => {
            const el = e.target;
            if (el.dataset.prop || el.dataset.propGlobal) {
                this._applyPropInput(el, true);
            }
        });

        // Enter key submits
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.dataset.prop) {
                this._applyPropInput(e.target, true);
                e.target.blur();
            }
        });
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    _applyColor(propPath, hex, opacity) {
        if (propPath === 'pageColor') {
            this.sceneGraph.pageColor = hex;
        } else {
            const ids = Array.from(this.sceneGraph.selectedAssetIds);
            ids.forEach(id => {
                const a = this.sceneGraph.assets.find(x => x.id === id);
                if (!a) return;
                if (propPath === 'properties.fill') {
                    a.properties.fill = hex;
                    a.properties.fillOpacity = opacity;
                    a.properties.fillHidden = false;
                } else if (propPath === 'properties.stroke') {
                    a.properties.stroke = hex;
                    a.properties.strokeOpacity = opacity;
                }
            });
        }
        // Update swatch thumbnail without full re-render (live feel)
        const thumb = this.content.querySelector(`[data-picker="${propPath}"]`);
        if (thumb) {
            thumb.style.background  = hex;
            thumb.dataset.hex       = hex;
            thumb.dataset.opacity   = opacity;
        }
        const hexIn = this.content.querySelector(
            `[data-prop="${propPath}"], [data-prop-global="${propPath}"]`
        );
        if (hexIn) hexIn.value = hex.replace('#','').toUpperCase();

        this.onUiChange(false); // live canvas update
    }

    _applyColorProp(propPath, hex) {
        const ids = Array.from(this.sceneGraph.selectedAssetIds);
        ids.forEach(id => {
            const a = this.sceneGraph.assets.find(x => x.id === id);
            if (!a) return;
            if (propPath.includes('.')) {
                const [obj, key] = propPath.split('.');
                a[obj][key] = hex;
            } else {
                a[propPath] = hex;
            }
        });
        // Live update swatch
        const thumb = this.content.querySelector(`[data-picker="${propPath}"]`);
        if (thumb) { thumb.style.background = hex; thumb.dataset.hex = hex; }
        this.onUiChange(false);
    }

    _applyPropInput(el, saveHistory) {
        const propPath = el.dataset.prop || el.dataset.propGlobal;
        if (!propPath) return;

        let value = el.type === 'number'
            ? parseFloat(el.value) || 0
            : el.value;

        // Global (canvas color)
        if (el.dataset.propGlobal) {
            if (propPath === 'pageColor') value = '#' + String(value).replace('#','');
            this.sceneGraph[propPath] = value;
            if (saveHistory) { this.onUiChange(true); this.render(); }
            else this.onUiChange(false);
            return;
        }

        const ids = Array.from(this.sceneGraph.selectedAssetIds);
        ids.forEach(id => {
            const a = this.sceneGraph.assets.find(x => x.id === id);
            if (!a) return;

            if (propPath === 'rotationDeg') {
                a.rotation = value * Math.PI / 180;
            } else if (propPath.includes('.')) {
                const [obj, key] = propPath.split('.');
                // Convert hex text to proper hex string
                if (key === 'fill' || key === 'stroke') {
                    value = '#' + String(value).replace('#','');
                }
                a[obj][key] = value;
            } else {
                a[propPath] = value;
            }
        });

        if (saveHistory) { this.onUiChange(true); this.render(); }
        else this.onUiChange(false);
    }

    _selectedAsset() {
        const ids = Array.from(this.sceneGraph.selectedAssetIds);
        if (ids.length === 0) return null;
        return this.sceneGraph.assets.find(a => a.id === ids[ids.length - 1]) || null;
    }

    _ensureHex(val) {
        if (!val || val === 'transparent' || val === 'none') return '#000000';
        if (!val.startsWith('#')) return '#000000';
        return val;
    }

    _cap(s) {
        return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
    }
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const SVG_EYE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
</svg>`;

const SVG_EYE_OFF = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8
             a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4
             c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19
             m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/>
</svg>`;

const ALIGN_ICONS = [
    `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M3 2v12h1V2H3zm3 3h7v2H6V5zm0 4h5v2H6V9z"/></svg>`,
    `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M7 2v12h2V2H7zM3 5h10v2H3V5zm2 4h6v2H5V9z"/></svg>`,
    `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M12 2v12h1V2h-1zM3 5h8v2H3V5zm2 4h6v2H5V9z"/></svg>`,
    `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M2 3h12v1H2V3zm3 3v7h2V6H5zm4 0v5h2V6H9z"/></svg>`,
    `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M2 7h12v2H2V7zM5 3v10h2V3H5zm4 2v6h2V5H9z"/></svg>`,
    `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M2 12h12v1H2v-1zM5 4v7h2V4H5zm4 2v5h2V6H9z"/></svg>`,
];
