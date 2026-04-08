export function HSVtoRGB(h, s, v) {
    let r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export function RGBtoHSV(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;
    const d = max - min;
    s = max == 0 ? 0 : d / max;
    if (max == min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h, s, v };
}

export function hexToRGB(hex) {
    let hs = hex.replace('#', '');
    if (hs.length === 3) hs = hs.split('').map(c => c+c).join('');
    const bigint = parseInt(hs, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

export function RGBToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
}

class ColorPickerEngine {
    constructor() {
        this.dom = null;
        this.hsv = { h: 1, s: 1, v: 1 };
        this.opacity = 100;
        this.onChange = null;
        this.sceneGraph = null;
        this.isDraggingMap = false;
        this.isDraggingHue = false;
        this.isDraggingAlpha = false;
        
        this.buildDOM();
    }

    buildDOM() {
        this.dom = document.createElement('div');
        this.dom.className = 'custom-color-picker';
        
        // Eyedropper API Check
        const hasPipette = window.EyeDropper ? true : false;

        this.dom.innerHTML = `
            <div class="cp-header">
                <span>Custom</span>
                <button class="icon-btn text-like close-btn" id="cp-close">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>
            <div class="cp-map" id="cp-map">
                <div class="cp-map-white"></div>
                <div class="cp-map-black"></div>
                <div class="cp-map-thumb" id="cp-map-thumb"></div>
            </div>
            <div class="cp-controls">
                ${hasPipette ? `
                <button class="icon-btn pipet-btn tooltip" id="cp-pipette" title="Pick color from screen">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                </button>
                ` : '<div style="width: 24px"></div>'}
                <div class="cp-sliders">
                    <div class="cp-slider hue" id="cp-slider-hue">
                        <div class="cp-slider-thumb" id="cp-thumb-hue"></div>
                    </div>
                    <div class="cp-slider alpha" id="cp-slider-alpha">
                        <div class="cp-slider-bg" id="cp-alpha-bg"></div>
                        <div class="cp-slider-thumb" id="cp-thumb-alpha"></div>
                    </div>
                </div>
            </div>
            <div class="cp-hex-row">
                <div class="cp-dropdown">Hex <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></div>
                <input type="text" id="cp-input-hex" class="cp-input hex-box">
                <input type="number" id="cp-input-opacity" class="cp-input pct-box" min="0" max="100">
                <span class="pct-symbol">%</span>
            </div>
            <div class="cp-gallery">
                <div class="cp-gallery-header">
                    <span>On this page</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                </div>
                <div class="cp-swatch-grid" id="cp-swatch-grid"></div>
            </div>
        `;
        
        document.body.appendChild(this.dom);
        
        this.map = this.dom.querySelector('#cp-map');
        this.thumbMap = this.dom.querySelector('#cp-map-thumb');
        
        this.sliderHue = this.dom.querySelector('#cp-slider-hue');
        this.thumbHue = this.dom.querySelector('#cp-thumb-hue');
        
        this.sliderAlpha = this.dom.querySelector('#cp-slider-alpha');
        this.thumbAlpha = this.dom.querySelector('#cp-thumb-alpha');
        this.alphaBg = this.dom.querySelector('#cp-alpha-bg');
        
        this.inputHex = this.dom.querySelector('#cp-input-hex');
        this.inputOpacity = this.dom.querySelector('#cp-input-opacity');
        this.galleryGrid = this.dom.querySelector('#cp-swatch-grid');
        
        this.bindEvents();
        this.close(); // hide initially
    }

    bindEvents() {
        this.dom.querySelector('#cp-close').addEventListener('click', () => this.close());
        
        // Hide when clicking entirely outside
        document.addEventListener('mousedown', (e) => {
            if (this.dom.style.display === 'block' && !this.dom.contains(e.target) && !e.target.closest('.color-swatch-label')) {
                this.close();
            }
        });

        // Map Drag
        const onMapMove = (e) => {
            if (!this.isDraggingMap) return;
            const rect = this.map.getBoundingClientRect();
            let x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
            let y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
            
            this.hsv.s = x / rect.width;
            this.hsv.v = 1 - (y / rect.height);
            this.updateInternal();
        };
        this.map.addEventListener('mousedown', (e) => {
            this.isDraggingMap = true;
            onMapMove(e);
        });
        document.addEventListener('mousemove', (e) => {
            if (this.isDraggingMap) onMapMove(e);
        });
        document.addEventListener('mouseup', () => this.isDraggingMap = false);

        // Hue Drag
        const onHueMove = (e) => {
            if (!this.isDraggingHue) return;
            const rect = this.sliderHue.getBoundingClientRect();
            let x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
            this.hsv.h = x / rect.width;
            this.updateInternal();
        };
        this.sliderHue.addEventListener('mousedown', (e) => {
            this.isDraggingHue = true;
            onHueMove(e);
        });
        document.addEventListener('mousemove', (e) => {
            if (this.isDraggingHue) onHueMove(e);
        });
        document.addEventListener('mouseup', () => this.isDraggingHue = false);

        // Alpha Drag
        const onAlphaMove = (e) => {
            if (!this.isDraggingAlpha) return;
            const rect = this.sliderAlpha.getBoundingClientRect();
            let x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
            this.opacity = Math.round((x / rect.width) * 100);
            this.updateInternal();
        };
        this.sliderAlpha.addEventListener('mousedown', (e) => {
            this.isDraggingAlpha = true;
            onAlphaMove(e);
        });
        document.addEventListener('mousemove', (e) => {
            if (this.isDraggingAlpha) onAlphaMove(e);
        });
        document.addEventListener('mouseup', () => this.isDraggingAlpha = false);

        // Inputs
        this.inputHex.addEventListener('blur', (e) => {
            let val = e.target.value.trim();
            if (!val.startsWith('#')) val = '#' + val;
            const rgb = hexToRGB(val);
            if (!isNaN(rgb.r)) {
                this.hsv = RGBtoHSV(rgb.r, rgb.g, rgb.b);
                this.updateInternal();
            }
        });
        this.inputOpacity.addEventListener('change', (e) => {
            let val = parseInt(e.target.value);
            if (isNaN(val)) val = 100;
            this.opacity = Math.max(0, Math.min(100, val));
            this.updateInternal();
        });

        // Eye Dropper 
        const pipet = this.dom.querySelector('#cp-pipette');
        if (pipet) {
            pipet.addEventListener('click', async () => {
                if (!window.EyeDropper) return;
                const eyeDropper = new window.EyeDropper();
                try {
                    const result = await eyeDropper.open();
                    const rgb = hexToRGB(result.sRGBHex);
                    this.hsv = RGBtoHSV(rgb.r, rgb.g, rgb.b);
                    this.updateInternal();
                } catch (e) {
                    console.log('EyeDropper aborted', e);
                }
            });
        }
    }

    // Refresh UI logic given new HSV bounds
    updateInternal() {
        const hRgb = HSVtoRGB(this.hsv.h, 1, 1);
        const rgb = HSVtoRGB(this.hsv.h, this.hsv.s, this.hsv.v);
        const hex = RGBToHex(rgb.r, rgb.g, rgb.b);

        // Updates UI Map Position & Color
        this.map.style.backgroundColor = `rgb(${hRgb.r}, ${hRgb.g}, ${hRgb.b})`;
        const mapW = this.map.clientWidth;
        const mapH = this.map.clientHeight;
        this.thumbMap.style.left = (this.hsv.s * mapW) - 6 + 'px';
        this.thumbMap.style.top = ((1 - this.hsv.v) * mapH) - 6 + 'px';
        this.thumbMap.style.backgroundColor = hex;

        // Updates Slider Thumbs
        const sliderW = this.sliderHue.clientWidth;
        this.thumbHue.style.left = (this.hsv.h * sliderW) - 6 + 'px';
        this.thumbAlpha.style.left = ((this.opacity / 100) * sliderW) - 6 + 'px';
        
        // Updates Alpha Gradient
        this.alphaBg.style.background = `linear-gradient(to right, rgba(${rgb.r},${rgb.g},${rgb.b},0), rgba(${rgb.r},${rgb.g},${rgb.b},1))`;

        // Update Text
        this.inputHex.value = hex.replace('#', '');
        this.inputOpacity.value = this.opacity;

        // Callback
        if (this.onChange) {
            this.onChange(hex, this.opacity);
        }
    }

    extractDocumentColors() {
        if (!this.sceneGraph) return;
        const set = new Set();
        if (this.sceneGraph.pageColor) set.add(this.sceneGraph.pageColor.toUpperCase());
        
        this.sceneGraph.assets.forEach(a => {
            if (a.properties.fill && a.properties.fill !== 'transparent') set.add(a.properties.fill.toUpperCase());
            if (a.properties.stroke && a.properties.stroke !== 'transparent') set.add(a.properties.stroke.toUpperCase());
        });

        const arr = Array.from(set);
        this.galleryGrid.innerHTML = '';
        arr.forEach(hexStr => {
            const swatch = document.createElement('div');
            swatch.className = 'cp-grid-swatch';
            swatch.style.backgroundColor = hexStr;
            swatch.addEventListener('click', () => {
                const rgb = hexToRGB(hexStr);
                this.hsv = RGBtoHSV(rgb.r, rgb.g, rgb.b);
                this.updateInternal();
            });
            this.galleryGrid.appendChild(swatch);
        });
    }

    open({ x, y, hex, opacity, sceneGraph, onChange }) {
        this.sceneGraph = sceneGraph;
        this.onChange = onChange;
        this.opacity = opacity !== undefined ? opacity : 100;
        
        const rgb = hexToRGB(hex);
        if (!isNaN(rgb.r)) {
            this.hsv = RGBtoHSV(rgb.r, rgb.g, rgb.b);
        }

        this.dom.style.display = 'block';
        
        // Positioning
        const winW = window.innerWidth;
        const domW = 240; 
        let finalX = x;
        if (x + domW > winW) {
            finalX = x - domW - 20; 
        } else {
            finalX += 20; // Show immediately to the right
        }
        
        this.dom.style.left = finalX + 'px';
        this.dom.style.top = Math.max(10, y) + 'px';

        // Wait a frame for DOM metrics to settle, then draw
        requestAnimationFrame(() => {
            this.extractDocumentColors();
            this.updateInternal();
        });
    }

    close() {
        this.dom.style.display = 'none';
        this.onChange = null;
    }
}

export const ColorPicker = new ColorPickerEngine();
