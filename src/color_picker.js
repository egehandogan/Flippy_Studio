/**
 * Flippy Studio — Figma-Style Color Picker
 * Exact reference: Custom header, 2D SV map, hue+alpha sliders,
 * Hex input + %, "On this page" swatches.
 */

// ── Color math ─────────────────────────────────────────────────────────────

export function HSVtoRGB(h, s, v) {
    let r, g, b, i = Math.floor(h * 6), f = h * 6 - i,
        p = v*(1-s), q = v*(1-f*s), t = v*(1-(1-f)*s);
    switch (i%6) {
        case 0: r=v;g=t;b=p; break; case 1: r=q;g=v;b=p; break;
        case 2: r=p;g=v;b=t; break; case 3: r=p;g=q;b=v; break;
        case 4: r=t;g=p;b=v; break; case 5: r=v;g=p;b=q; break;
    }
    return { r: Math.round(r*255), g: Math.round(g*255), b: Math.round(b*255) };
}

export function RGBtoHSV(r, g, b) {
    r/=255; g/=255; b/=255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b), d=max-min;
    let h=0, s=max===0?0:d/max, v=max;
    if (max!==min) { switch(max) {
        case r: h=((g-b)/d+(g<b?6:0))/6; break;
        case g: h=((b-r)/d+2)/6; break;
        case b: h=((r-g)/d+4)/6; break;
    }}
    return { h, s, v };
}

export function hexToRGB(hex) {
    let c = (hex||'').replace('#','');
    if (c.length===3) c=c.split('').map(x=>x+x).join('');
    if (c.length!==6) return {r:0,g:0,b:0};
    const n=parseInt(c,16);
    return {r:(n>>16)&255, g:(n>>8)&255, b:n&255};
}

export function RGBToHex(r,g,b) {
    return '#'+[r,g,b].map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('').toUpperCase();
}

// ── Document color registry ───────────────────────────────────────────────
const _docColors = [];
export function addDocColor(hex) {
    if (!hex || hex==='transparent') return;
    const h=hex.toUpperCase();
    const i=_docColors.indexOf(h); if(i!==-1) _docColors.splice(i,1);
    _docColors.unshift(h);
    if(_docColors.length>32) _docColors.pop();
}

// ── Picker Engine ─────────────────────────────────────────────────────────
class ColorPickerEngine {
    constructor() {
        this.hsv       = { h:0, s:1, v:1 };
        this.opacity   = 100;
        this.onChange  = null;
        this.sceneGraph = null;
        this._mapDrag  = false;
        this._hueDrag  = false;
        this._aDrag    = false;
        this._swatchOpen = true;
        this._build();
        this._wire();
    }

    // ── DOM ───────────────────────────────────────────────────────────────
    _build() {
        const el = document.createElement('div');
        el.className = 'fcp';
        el.innerHTML = `
        <div class="fcp-header">
            <span class="fcp-title">Custom</span>
            <button class="fcp-close" id="fcp-close" title="Close">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        </div>

        <!-- 2D SV Map -->
        <div class="fcp-map-wrap" id="fcp-map-wrap">
            <canvas class="fcp-map-canvas" id="fcp-map-canvas"></canvas>
            <div class="fcp-map-cursor" id="fcp-map-cursor"></div>
        </div>

        <!-- Controls: eyedropper + sliders -->
        <div class="fcp-controls">
            <button class="fcp-eye" id="fcp-eye" title="Pick color from screen">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22C6.5 22 2 17.5 2 12M12 22C17.5 22 22 17.5 22 12"/>
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M2 12C2 6.5 6.5 2 12 2s10 4.5 10 10"/>
                </svg>
            </button>
            <div class="fcp-sliders">
                <!-- Hue -->
                <div class="fcp-slider fcp-hue" id="fcp-hue">
                    <div class="fcp-hue-bg"></div>
                    <div class="fcp-slider-thumb" id="fcp-hue-thumb"></div>
                </div>
                <!-- Alpha -->
                <div class="fcp-slider fcp-alpha" id="fcp-alpha">
                    <div class="fcp-checker fcp-alpha-checker"></div>
                    <div class="fcp-alpha-bg" id="fcp-alpha-bg"></div>
                    <div class="fcp-slider-thumb" id="fcp-alpha-thumb"></div>
                </div>
            </div>
        </div>

        <!-- Hex / Opacity inputs -->
        <div class="fcp-inputs">
            <button class="fcp-format-btn" id="fcp-format-btn">Hex
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <input class="fcp-hex" id="fcp-hex" type="text" maxlength="6" spellcheck="false" value="000000"/>
            <input class="fcp-opacity" id="fcp-opacity" type="number" min="0" max="100" value="100"/>
            <span class="fcp-pct">%</span>
        </div>

        <!-- On this page swatches -->
        <div class="fcp-page-section" id="fcp-page-section">
            <button class="fcp-page-hdr" id="fcp-page-hdr">
                <span>On this page</span>
                <svg class="fcp-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <div class="fcp-swatch-grid" id="fcp-swatch-grid"></div>
        </div>`;

        document.body.appendChild(el);
        this.el = el;
        el.style.display = 'none';

        // Refs
        this.mapWrap   = el.querySelector('#fcp-map-wrap');
        this.mapCanvas = el.querySelector('#fcp-map-canvas');
        this.mapCtx    = this.mapCanvas.getContext('2d');
        this.mapCursor = el.querySelector('#fcp-map-cursor');
        this.hueTrack  = el.querySelector('#fcp-hue');
        this.hueThumb  = el.querySelector('#fcp-hue-thumb');
        this.aTrack    = el.querySelector('#fcp-alpha');
        this.aThumb    = el.querySelector('#fcp-alpha-thumb');
        this.aBg       = el.querySelector('#fcp-alpha-bg');
        this.hexInput  = el.querySelector('#fcp-hex');
        this.opInput   = el.querySelector('#fcp-opacity');
        this.swGrid    = el.querySelector('#fcp-swatch-grid');
    }

    // ── Draw ──────────────────────────────────────────────────────────────
    _drawMap() {
        const c = this.mapCanvas, ctx = this.mapCtx;
        const W = c.width, H = c.height;
        if (W===0||H===0) return;

        const {r,g,b} = HSVtoRGB(this.hsv.h, 1, 1);
        // Base hue
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(0,0,W,H);
        // White→transparent (left→right)
        const gw = ctx.createLinearGradient(0,0,W,0);
        gw.addColorStop(0,'rgba(255,255,255,1)');
        gw.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle = gw; ctx.fillRect(0,0,W,H);
        // Transparent→black (top→bottom)
        const gb = ctx.createLinearGradient(0,0,0,H);
        gb.addColorStop(0,'rgba(0,0,0,0)');
        gb.addColorStop(1,'rgba(0,0,0,1)');
        ctx.fillStyle = gb; ctx.fillRect(0,0,W,H);
    }

    _placeMapCursor() {
        const W = this.mapCanvas.width, H = this.mapCanvas.height;
        const x = this.hsv.s * W, y = (1-this.hsv.v) * H;
        this.mapCursor.style.left = `${x}px`;
        this.mapCursor.style.top  = `${y}px`;
        // Cursor color — invert for contrast
        this.mapCursor.style.borderColor = this.hsv.v > 0.55 && this.hsv.s < 0.6
            ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)';
    }

    _placeHueThumb() {
        const W = this.hueTrack.offsetWidth || 160;
        this.hueThumb.style.left = `${this.hsv.h * W}px`;
        const {r,g,b} = HSVtoRGB(this.hsv.h,1,1);
        this.hueThumb.style.background = `rgb(${r},${g},${b})`;
    }

    _placeAlphaThumb() {
        const W = this.aTrack.offsetWidth || 160;
        this.aThumb.style.left = `${(this.opacity/100) * W}px`;
    }

    _updateAlphaBg() {
        const {r,g,b} = HSVtoRGB(this.hsv.h, this.hsv.s, this.hsv.v);
        this.aBg.style.background =
            `linear-gradient(to right, rgba(${r},${g},${b},0), rgb(${r},${g},${b}))`;
    }

    _refreshAll() {
        this._drawMap();
        this._placeMapCursor();
        this._placeHueThumb();
        this._placeAlphaThumb();
        this._updateAlphaBg();
        this._syncInputs();
    }

    _syncInputs() {
        const {r,g,b} = HSVtoRGB(this.hsv.h, this.hsv.s, this.hsv.v);
        const hex = RGBToHex(r,g,b).replace('#','');
        if (document.activeElement !== this.hexInput) this.hexInput.value = hex;
        if (document.activeElement !== this.opInput)  this.opInput.value  = Math.round(this.opacity);
    }

    _emit() {
        if (!this.onChange) return;
        const {r,g,b} = HSVtoRGB(this.hsv.h, this.hsv.s, this.hsv.v);
        this.onChange(RGBToHex(r,g,b), Math.round(this.opacity));
    }

    // ── Event binding ─────────────────────────────────────────────────────
    _wire() {
        // Close button
        this.el.querySelector('#fcp-close').addEventListener('click', () => this.close());

        // ── Map drag ──────────────────────────────────────────────────────
        const onMapMove = (e) => {
            if (!this._mapDrag) return;
            const r = this.mapCanvas.getBoundingClientRect();
            const cx = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
            const cy = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
            this.hsv.s = Math.max(0, Math.min(1, (cx-r.left)/r.width));
            this.hsv.v = Math.max(0, Math.min(1, 1-(cy-r.top)/r.height));
            this._refreshAll(); this._emit();
        };
        this.mapWrap.addEventListener('pointerdown', (e) => {
            this._mapDrag = true;
            this.mapWrap.setPointerCapture(e.pointerId);
            onMapMove(e);
        });
        this.mapWrap.addEventListener('pointermove', onMapMove);
        this.mapWrap.addEventListener('pointerup',   () => this._mapDrag = false);

        // ── Hue drag ──────────────────────────────────────────────────────
        const onHueMove = (e) => {
            if (!this._hueDrag) return;
            const r = this.hueTrack.getBoundingClientRect();
            this.hsv.h = Math.max(0, Math.min(1, (e.clientX-r.left)/r.width));
            this._drawMap(); this._placeMapCursor();
            this._placeHueThumb(); this._updateAlphaBg();
            this._syncInputs(); this._emit();
        };
        this.hueTrack.addEventListener('pointerdown', (e) => {
            this._hueDrag = true;
            this.hueTrack.setPointerCapture(e.pointerId);
            onHueMove(e);
        });
        this.hueTrack.addEventListener('pointermove', onHueMove);
        this.hueTrack.addEventListener('pointerup',   () => this._hueDrag = false);

        // ── Alpha drag ────────────────────────────────────────────────────
        const onAlphaMove = (e) => {
            if (!this._aDrag) return;
            const r = this.aTrack.getBoundingClientRect();
            this.opacity = Math.max(0, Math.min(100, ((e.clientX-r.left)/r.width)*100));
            this._placeAlphaThumb(); this._syncInputs(); this._emit();
        };
        this.aTrack.addEventListener('pointerdown', (e) => {
            this._aDrag = true;
            this.aTrack.setPointerCapture(e.pointerId);
            onAlphaMove(e);
        });
        this.aTrack.addEventListener('pointermove', onAlphaMove);
        this.aTrack.addEventListener('pointerup',   () => this._aDrag = false);

        // ── Hex input ─────────────────────────────────────────────────────
        this.hexInput.addEventListener('input', () => {
            const v = this.hexInput.value.trim().replace('#','');
            if (v.length!==6) return;
            const {r,g,b} = hexToRGB(v);
            Object.assign(this.hsv, RGBtoHSV(r,g,b));
            this._drawMap(); this._placeMapCursor();
            this._placeHueThumb(); this._updateAlphaBg();
            this._placeAlphaThumb(); this._emit();
        });
        this.hexInput.addEventListener('keydown', e => { if(e.key==='Enter') this.hexInput.blur(); });
        this.hexInput.addEventListener('paste', (e) => {
            // Allow pasting #RRGGBB
            setTimeout(() => {
                const v = this.hexInput.value.replace('#','').trim();
                if (v.length===6) this.hexInput.dispatchEvent(new Event('input'));
            }, 0);
        });

        // ── Opacity input ─────────────────────────────────────────────────
        this.opInput.addEventListener('input', () => {
            const v = parseFloat(this.opInput.value);
            if (isNaN(v)) return;
            this.opacity = Math.max(0, Math.min(100, v));
            this._placeAlphaThumb(); this._emit();
        });

        // ── Eye dropper ───────────────────────────────────────────────────
        const eyeBtn = this.el.querySelector('#fcp-eye');
        if (window.EyeDropper) {
            eyeBtn.addEventListener('click', async () => {
                try {
                    const res = await new window.EyeDropper().open();
                    const {r,g,b} = hexToRGB(res.sRGBHex);
                    Object.assign(this.hsv, RGBtoHSV(r,g,b));
                    this._refreshAll(); this._emit();
                } catch {}
            });
        } else {
            eyeBtn.style.opacity = '0.3';
            eyeBtn.title = 'Not supported in this browser';
        }

        // ── Swatch collapse ───────────────────────────────────────────────
        this.el.querySelector('#fcp-page-hdr').addEventListener('click', () => {
            this._swatchOpen = !this._swatchOpen;
            this.swGrid.style.display = this._swatchOpen ? 'flex' : 'none';
            this.el.querySelector('.fcp-chevron').style.transform =
                this._swatchOpen ? 'rotate(0deg)' : 'rotate(-90deg)';
        });

        // ── Outside click close ───────────────────────────────────────────
        document.addEventListener('pointerdown', (e) => {
            if (this.el.style.display === 'none') return;
            if (!this.el.contains(e.target) && !e.target.closest('.color-swatch-label')) {
                this.close();
            }
        }, true);

        // ── Prevent picker click from propagating to canvas ───────────────
        this.el.addEventListener('pointerdown', e => e.stopPropagation());
    }

    // ── Swatches ──────────────────────────────────────────────────────────
    _renderSwatches() {
        const colors = new Set();
        if (this.sceneGraph) {
            this.sceneGraph.assets.forEach(a => {
                if (a.properties.fill && a.properties.fill !== 'transparent')
                    colors.add(a.properties.fill.toUpperCase());
                if (a.properties.stroke && a.properties.stroke !== 'transparent')
                    colors.add(a.properties.stroke.toUpperCase());
            });
        }
        _docColors.forEach(c => colors.add(c));

        this.swGrid.innerHTML = '';
        if (colors.size === 0) {
            this.swGrid.innerHTML = `<span style="color:rgba(255,255,255,0.2);font-size:10px;padding:2px 0">No colors yet</span>`;
            return;
        }
        colors.forEach(hex => {
            const sw = document.createElement('div');
            sw.className = 'fcp-swatch';
            sw.style.background = hex;
            sw.title = hex;
            sw.addEventListener('click', () => {
                const {r,g,b} = hexToRGB(hex);
                Object.assign(this.hsv, RGBtoHSV(r,g,b));
                this._refreshAll(); this._emit();
            });
            this.swGrid.appendChild(sw);
        });
    }

    // ── Open / Close ─────────────────────────────────────────────────────
    open({ x, y, hex, opacity = 100, sceneGraph, onChange }) {
        this.sceneGraph = sceneGraph;
        this.onChange   = onChange;
        this.opacity    = opacity ?? 100;

        const {r,g,b} = hexToRGB(hex || '#FFFFFF');
        Object.assign(this.hsv, RGBtoHSV(r,g,b));

        this.el.style.display = 'block';

        // Batch DOM reads in next frame once element is visible
        requestAnimationFrame(() => {
            // Fit canvas to its container
            const wr = this.mapWrap.getBoundingClientRect();
            this.mapCanvas.width  = Math.round(wr.width);
            this.mapCanvas.height = Math.round(wr.height);

            // Smart position — prefer left of cursor, avoid edges
            const PW = this.el.offsetWidth  || 210;
            const PH = this.el.offsetHeight || 400;
            let lx = x - PW - 16;
            let ly = y - 32;
            if (lx < 8) lx = x + 16;
            if (lx + PW > window.innerWidth  - 8) lx = 8;
            if (ly + PH > window.innerHeight - 8) ly = window.innerHeight - PH - 8;
            if (ly < 8) ly = 8;
            this.el.style.left = `${lx}px`;
            this.el.style.top  = `${ly}px`;

            this._refreshAll();
            this._renderSwatches();
        });
    }

    close() {
        // Store used color
        const {r,g,b} = HSVtoRGB(this.hsv.h, this.hsv.s, this.hsv.v);
        addDocColor(RGBToHex(r,g,b));
        this.el.style.display = 'none';
        this.onChange = null;
    }
}

export const ColorPicker = new ColorPickerEngine();
