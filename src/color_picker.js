/**
 * Flippy Studio — Professional Color Picker
 * Figma-style: HSV 2D map, hue/alpha sliders, hex/rgb inputs,
 * document colors, real-time apply, eyedropper support.
 */

// ── Color math utilities ─────────────────────────────────────────────────────

export function HSVtoRGB(h, s, v) {
    let r, g, b, i = Math.floor(h * 6), f = h * 6 - i,
        p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r=v; g=t; b=p; break; case 1: r=q; g=v; b=p; break;
        case 2: r=p; g=v; b=t; break; case 3: r=p; g=q; b=v; break;
        case 4: r=t; g=p; b=v; break; case 5: r=v; g=p; b=q; break;
    }
    return { r: Math.round(r*255), g: Math.round(g*255), b: Math.round(b*255) };
}

export function RGBtoHSV(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min;
    let h = 0, s = max === 0 ? 0 : d / max, v = max;
    if (max !== min) {
        switch (max) {
            case r: h = ((g-b)/d + (g<b?6:0))/6; break;
            case g: h = ((b-r)/d + 2)/6; break;
            case b: h = ((r-g)/d + 4)/6; break;
        }
    }
    return { h, s, v };
}

export function hexToRGB(hex) {
    let c = hex.replace('#','');
    if (c.length === 3) c = c.split('').map(x=>x+x).join('');
    const n = parseInt(c, 16);
    return { r: (n>>16)&255, g: (n>>8)&255, b: n&255 };
}

export function RGBToHex(r, g, b) {
    return '#' + [r,g,b].map(v => Math.round(v).toString(16).padStart(2,'0')).join('').toUpperCase();
}

// ── Document color registry ───────────────────────────────────────────────────
const _docColors = [];
function addDocColor(hex) {
    if (!hex || hex === 'transparent') return;
    const h = hex.toUpperCase();
    const i = _docColors.indexOf(h);
    if (i !== -1) _docColors.splice(i, 1);
    _docColors.unshift(h);
    if (_docColors.length > 32) _docColors.pop();
}

// ── Color Picker Engine ───────────────────────────────────────────────────────
class ColorPickerEngine {
    constructor() {
        this.dom        = null;
        this.canvas     = null;
        this.ctx        = null;
        this.hsv        = { h: 0, s: 1, v: 1 };
        this.opacity    = 100;
        this.onChange   = null;
        this.sceneGraph = null;

        this._mapDrag   = false;
        this._hueDrag   = false;
        this._alphaDrag = false;
        this._mode      = 'HEX'; // 'HEX' | 'RGB'

        this._buildDOM();
        this._bindSliders();
        this._bindInputs();
        this._bindOutsideClose();
        this.dom.style.display = 'none';
    }

    // ── DOM ────────────────────────────────────────────────────────────────
    _buildDOM() {
        this.dom = document.createElement('div');
        this.dom.className = 'cp';
        this.dom.innerHTML = `
        <div class="cp-map-area">
            <canvas class="cp-map-canvas"></canvas>
            <div class="cp-map-thumb"></div>
        </div>
        <div class="cp-row cp-sliders-row">
            <div class="cp-preview-stack">
                <div class="cp-checker-bg"></div>
                <div class="cp-preview-color"></div>
            </div>
            <div class="cp-sliders-col">
                <div class="cp-slider-wrap cp-hue-wrap">
                    <div class="cp-hue-rail"></div>
                    <div class="cp-slider-thumb" id="cp-hue-thumb"></div>
                </div>
                <div class="cp-slider-wrap cp-alpha-wrap">
                    <div class="cp-checker-rail"></div>
                    <div class="cp-alpha-rail"></div>
                    <div class="cp-slider-thumb" id="cp-alpha-thumb"></div>
                </div>
            </div>
        </div>
        <div class="cp-row cp-inputs-row">
            <button class="cp-pipette" id="cp-pipette" title="Eye dropper" style="display:${window.EyeDropper ? 'flex' : 'none'}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L11 6.67l-1.78-1.78a5.5 5.5 0 00-7.78 7.78l1.78 1.78L12 23l8.84-8.84a5.5 5.5 0 000-7.78z"/>
                    <path d="M6 2L2 6"/><path d="M4.5 15.5L3 17"/>
                </svg>
            </button>
            <button class="cp-mode-btn" id="cp-mode-btn" title="Switch mode">HEX</button>
            <div class="cp-fields">
                <div class="cp-field-group" id="cp-hex-group">
                    <input class="cp-field-input" id="cp-hex-in" maxlength="6" spellcheck="false" value="FFFFFF"/>
                    <span class="cp-field-label">HEX</span>
                </div>
                <div class="cp-field-group" id="cp-rgb-r" style="display:none">
                    <input class="cp-field-input cp-num" type="number" min="0" max="255" value="255"/>
                    <span class="cp-field-label">R</span>
                </div>
                <div class="cp-field-group" id="cp-rgb-g" style="display:none">
                    <input class="cp-field-input cp-num" type="number" min="0" max="255" value="255"/>
                    <span class="cp-field-label">G</span>
                </div>
                <div class="cp-field-group" id="cp-rgb-b" style="display:none">
                    <input class="cp-field-input cp-num" type="number" min="0" max="255" value="255"/>
                    <span class="cp-field-label">B</span>
                </div>
            </div>
            <div class="cp-field-group cp-opacity-group">
                <input class="cp-field-input cp-num" id="cp-opacity-in" type="number" min="0" max="100" value="100"/>
                <span class="cp-field-label">%</span>
            </div>
        </div>
        <div class="cp-doc-section">
            <div class="cp-doc-title">Document colors</div>
            <div class="cp-doc-grid" id="cp-doc-grid"></div>
        </div>
        `;
        document.body.appendChild(this.dom);

        // Canvas map setup
        this.canvas = this.dom.querySelector('.cp-map-canvas');
        this.ctx    = this.canvas.getContext('2d');

        this.mapThumb   = this.dom.querySelector('.cp-map-thumb');
        this.hueThumb   = this.dom.querySelector('#cp-hue-thumb');
        this.alphaThumb = this.dom.querySelector('#cp-alpha-thumb');
        this.alphaRail  = this.dom.querySelector('.cp-alpha-rail');
        this.preview    = this.dom.querySelector('.cp-preview-color');
        this.hexIn      = this.dom.querySelector('#cp-hex-in');
        this.opacityIn  = this.dom.querySelector('#cp-opacity-in');
        this.rIn        = this.dom.querySelector('#cp-rgb-r input');
        this.gIn        = this.dom.querySelector('#cp-rgb-g input');
        this.bIn        = this.dom.querySelector('#cp-rgb-b input');
        this.docGrid    = this.dom.querySelector('#cp-doc-grid');
        this.modeBtn    = this.dom.querySelector('#cp-mode-btn');
    }

    // ── Canvas drawing ─────────────────────────────────────────────────────
    _drawMap() {
        const W = this.canvas.width, H = this.canvas.height;
        const { r, g, b } = HSVtoRGB(this.hsv.h, 1, 1);

        // Hue base
        this.ctx.fillStyle = `rgb(${r},${g},${b})`;
        this.ctx.fillRect(0, 0, W, H);

        // White left gradient
        const sw = this.ctx.createLinearGradient(0, 0, W, 0);
        sw.addColorStop(0, 'rgba(255,255,255,1)');
        sw.addColorStop(1, 'rgba(255,255,255,0)');
        this.ctx.fillStyle = sw;
        this.ctx.fillRect(0, 0, W, H);

        // Black bottom gradient
        const sb = this.ctx.createLinearGradient(0, 0, 0, H);
        sb.addColorStop(0, 'rgba(0,0,0,0)');
        sb.addColorStop(1, 'rgba(0,0,0,0.95)');
        this.ctx.fillStyle = sb;
        this.ctx.fillRect(0, 0, W, H);
    }

    _updateAlphaRail() {
        const { r, g, b } = HSVtoRGB(this.hsv.h, this.hsv.s, this.hsv.v);
        this.alphaRail.style.background =
            `linear-gradient(to right, rgba(${r},${g},${b},0), rgb(${r},${g},${b}))`;
    }

    // ── Thumb positions ────────────────────────────────────────────────────
    _placeMapThumb() {
        const W = this.canvas.width, H = this.canvas.height;
        const x = this.hsv.s * W;
        const y = (1 - this.hsv.v) * H;
        this.mapThumb.style.left = `${x}px`;
        this.mapThumb.style.top  = `${y}px`;
        const { r, g, b } = HSVtoRGB(this.hsv.h, this.hsv.s, this.hsv.v);
        this.mapThumb.style.background = `rgb(${r},${g},${b})`;
        // Invert thumb ring for dark backgrounds
        this.mapThumb.style.borderColor = this.hsv.v > 0.5 ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)';
    }

    _placeHueThumb() {
        const W = this.dom.querySelector('.cp-hue-wrap').offsetWidth;
        this.hueThumb.style.left = `${this.hsv.h * W}px`;
    }

    _placeAlphaThumb() {
        const W = this.dom.querySelector('.cp-alpha-wrap').offsetWidth;
        this.alphaThumb.style.left = `${(this.opacity / 100) * W}px`;
    }

    // ── Sync all visuals ───────────────────────────────────────────────────
    _refresh() {
        this._drawMap();
        this._updateAlphaRail();
        this._placeMapThumb();
        this._placeHueThumb();
        this._placeAlphaThumb();
        this._updatePreview();
        this._updateInputs();
    }

    _updatePreview() {
        const { r, g, b } = HSVtoRGB(this.hsv.h, this.hsv.s, this.hsv.v);
        this.preview.style.background = `rgba(${r},${g},${b},${this.opacity/100})`;
    }

    _updateInputs() {
        const { r, g, b } = HSVtoRGB(this.hsv.h, this.hsv.s, this.hsv.v);
        const hex = RGBToHex(r, g, b).replace('#', '');
        if (document.activeElement !== this.hexIn)     this.hexIn.value     = hex;
        if (document.activeElement !== this.opacityIn) this.opacityIn.value = Math.round(this.opacity);
        if (document.activeElement !== this.rIn) this.rIn.value = r;
        if (document.activeElement !== this.gIn) this.gIn.value = g;
        if (document.activeElement !== this.bIn) this.bIn.value = b;
    }

    _emit() {
        if (!this.onChange) return;
        const { r, g, b } = HSVtoRGB(this.hsv.h, this.hsv.s, this.hsv.v);
        this.onChange(RGBToHex(r, g, b), Math.round(this.opacity));
    }

    // ── Slider binding ─────────────────────────────────────────────────────
    _bindSliders() {
        // Map (2D SV picker)
        const mapArea = this.dom.querySelector('.cp-map-area');
        const onMapMove = (e) => {
            if (!this._mapDrag) return;
            const r = this.canvas.getBoundingClientRect();
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            this.hsv.s = Math.max(0, Math.min(1, (cx - r.left) / r.width));
            this.hsv.v = Math.max(0, Math.min(1, 1 - (cy - r.top) / r.height));
            this._refresh(); this._emit();
        };
        mapArea.addEventListener('pointerdown', (e) => {
            this._mapDrag = true; mapArea.setPointerCapture(e.pointerId); onMapMove(e);
        });
        mapArea.addEventListener('pointermove', onMapMove);
        mapArea.addEventListener('pointerup', () => this._mapDrag = false);

        // Hue slider
        const hueWrap = this.dom.querySelector('.cp-hue-wrap');
        const onHueMove = (e) => {
            if (!this._hueDrag) return;
            const r = hueWrap.getBoundingClientRect();
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            this.hsv.h = Math.max(0, Math.min(1, (cx - r.left) / r.width));
            this._refresh(); this._emit();
        };
        hueWrap.addEventListener('pointerdown', (e) => {
            this._hueDrag = true; hueWrap.setPointerCapture(e.pointerId); onHueMove(e);
        });
        hueWrap.addEventListener('pointermove', onHueMove);
        hueWrap.addEventListener('pointerup', () => this._hueDrag = false);

        // Alpha slider
        const alphaWrap = this.dom.querySelector('.cp-alpha-wrap');
        const onAlphaMove = (e) => {
            if (!this._alphaDrag) return;
            const r = alphaWrap.getBoundingClientRect();
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            this.opacity = Math.max(0, Math.min(100, ((cx - r.left) / r.width) * 100));
            this._placeAlphaThumb(); this._updatePreview(); this._updateInputs(); this._emit();
        };
        alphaWrap.addEventListener('pointerdown', (e) => {
            this._alphaDrag = true; alphaWrap.setPointerCapture(e.pointerId); onAlphaMove(e);
        });
        alphaWrap.addEventListener('pointermove', onAlphaMove);
        alphaWrap.addEventListener('pointerup', () => this._alphaDrag = false);
    }

    _bindInputs() {
        // Hex input
        this.hexIn.addEventListener('input', () => {
            const v = this.hexIn.value.trim().replace('#','');
            if (v.length !== 6) return;
            const { r, g, b } = hexToRGB(v);
            if (isNaN(r)) return;
            Object.assign(this.hsv, RGBtoHSV(r, g, b));
            this._drawMap(); this._updateAlphaRail();
            this._placeMapThumb(); this._placeHueThumb();
            this._updatePreview(); this._emit();
        });
        this.hexIn.addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });

        // Opacity
        this.opacityIn.addEventListener('input', () => {
            const v = parseFloat(this.opacityIn.value);
            if (isNaN(v)) return;
            this.opacity = Math.max(0, Math.min(100, v));
            this._placeAlphaThumb(); this._updatePreview(); this._emit();
        });

        // RGB inputs
        const fromRGB = () => {
            const r = parseInt(this.rIn.value)||0, g = parseInt(this.gIn.value)||0, b = parseInt(this.bIn.value)||0;
            Object.assign(this.hsv, RGBtoHSV(
                Math.max(0,Math.min(255,r)), Math.max(0,Math.min(255,g)), Math.max(0,Math.min(255,b))
            ));
            this._drawMap(); this._updateAlphaRail();
            this._placeMapThumb(); this._placeHueThumb();
            this._updatePreview(); this._updateInputs(); this._emit();
        };
        [this.rIn, this.gIn, this.bIn].forEach(el => el.addEventListener('input', fromRGB));

        // Mode toggle
        this.modeBtn.addEventListener('click', () => {
            this._mode = this._mode === 'HEX' ? 'RGB' : 'HEX';
            this.modeBtn.textContent = this._mode;
            const hexG  = this.dom.querySelector('#cp-hex-group');
            const rG = this.dom.querySelector('#cp-rgb-r');
            const gG = this.dom.querySelector('#cp-rgb-g');
            const bG = this.dom.querySelector('#cp-rgb-b');
            const isHex = this._mode === 'HEX';
            hexG.style.display = isHex ? 'flex' : 'none';
            rG.style.display = gG.style.display = bG.style.display = isHex ? 'none' : 'flex';
        });

        // Eye dropper
        const pipette = this.dom.querySelector('#cp-pipette');
        if (pipette && window.EyeDropper) {
            pipette.addEventListener('click', async () => {
                try {
                    const result = await new window.EyeDropper().open();
                    const { r, g, b } = hexToRGB(result.sRGBHex);
                    Object.assign(this.hsv, RGBtoHSV(r, g, b));
                    this._refresh(); this._emit();
                } catch (e) { /* aborted */ }
            });
        }
    }

    _bindOutsideClose() {
        document.addEventListener('pointerdown', (e) => {
            if (this.dom.style.display !== 'block') return;
            if (!this.dom.contains(e.target) && !e.target.closest('.color-swatch-label')) {
                this.close();
            }
        }, true);
    }

    // ── Document colors ────────────────────────────────────────────────────
    _renderDocColors() {
        const colors = new Set(_docColors);
        // Also pull from sceneGraph
        if (this.sceneGraph) {
            this.sceneGraph.assets.forEach(a => {
                if (a.properties.fill && a.properties.fill !== 'transparent') colors.add(a.properties.fill.toUpperCase());
                if (a.properties.stroke && a.properties.stroke !== 'transparent') colors.add(a.properties.stroke.toUpperCase());
            });
        }
        this.docGrid.innerHTML = '';
        if (colors.size === 0) {
            this.docGrid.innerHTML = `<span style="color:rgba(255,255,255,0.2);font-size:10px;padding:4px 0">No colors yet</span>`;
            return;
        }
        colors.forEach(hex => {
            const sw = document.createElement('div');
            sw.className = 'cp-doc-swatch';
            sw.style.background = hex;
            sw.title = hex;
            sw.addEventListener('click', () => {
                const { r, g, b } = hexToRGB(hex);
                Object.assign(this.hsv, RGBtoHSV(r, g, b));
                this._refresh(); this._emit();
            });
            this.docGrid.appendChild(sw);
        });
    }

    // ── Public API ─────────────────────────────────────────────────────────
    open({ x, y, hex, opacity = 100, sceneGraph, onChange }) {
        this.sceneGraph = sceneGraph;
        this.onChange   = onChange;
        this.opacity    = opacity ?? 100;

        const { r, g, b } = hexToRGB(hex || '#FFFFFF');
        if (!isNaN(r)) Object.assign(this.hsv, RGBtoHSV(r, g, b));

        this.dom.style.display = 'block';

        // Smart positioning
        requestAnimationFrame(() => {
            const PW = this.dom.offsetWidth  || 244;
            const PH = this.dom.offsetHeight || 360;
            let lx = x + 12, ly = y - 8;
            if (lx + PW > window.innerWidth  - 8) lx = x - PW - 8;
            if (ly + PH > window.innerHeight - 8) ly = window.innerHeight - PH - 8;
            if (ly < 8) ly = 8; if (lx < 8) lx = 8;
            this.dom.style.left = `${lx}px`;
            this.dom.style.top  = `${ly}px`;

            // Size canvas from DOM
            const mapEl = this.dom.querySelector('.cp-map-area');
            this.canvas.width  = mapEl.clientWidth;
            this.canvas.height = mapEl.clientHeight;

            this._refresh();
            this._renderDocColors();
        });
    }

    close() {
        // Save used color to doc registry
        const { r, g, b } = HSVtoRGB(this.hsv.h, this.hsv.s, this.hsv.v);
        addDocColor(RGBToHex(r, g, b));
        this.dom.style.display = 'none';
        this.onChange = null;
    }
}

export const ColorPicker = new ColorPickerEngine();
