import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';

// ── Color Utilities ──
function hexToHsv(hex: string): { h: number; s: number; v: number } {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s, v };
}

function hsvToHex(h: number, s: number, v: number): string {
  h = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hueToColor(h: number): string {
  return hsvToHex(h, 1, 1);
}

// ── Preset Colors ──
const PAGE_COLORS = [
  '#000000', '#1A1A1A', '#333333', '#4D4D4D', '#666666', '#808080', '#999999', '#B3B3B3', '#CCCCCC', '#FFFFFF',
  '#1A0000', '#330000', '#4D0000', '#660000', '#990000', '#CC0000', '#FF0000', '#FF3333', '#FF6666', '#FF9999',
  '#0D001A', '#1A0033', '#33004D', '#4D0066', '#660099', '#8800CC', '#AA00FF', '#BB33FF', '#CC66FF', '#00FF00',
  '#00FFFF', '#0095FF',
];

interface ColorPickerProps {
  color: string;
  opacity: number;
  onChange: (color: string) => void;
  onOpacityChange: (opacity: number) => void;
  onClose: () => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, opacity, onChange, onOpacityChange, onClose }) => {
  const [hsv, setHsv] = useState(() => hexToHsv(color));
  const [hexInput, setHexInput] = useState(color.replace('#', ''));

  const satValRef = useRef<HTMLCanvasElement>(null);
  const hueRef = useRef<HTMLCanvasElement>(null);
  const alphaRef = useRef<HTMLCanvasElement>(null);
  const isDraggingSV = useRef(false);
  const isDraggingHue = useRef(false);
  const isDraggingAlpha = useRef(false);

  // Sync external color changes
  useEffect(() => {
    const newHsv = hexToHsv(color);
    setHsv(newHsv);
    setHexInput(color.replace('#', ''));
  }, [color]);

  // ── Draw Saturation/Value gradient ──
  const drawSatVal = useCallback(() => {
    const canvas = satValRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;

    // White-to-hue horizontal gradient
    const hGrad = ctx.createLinearGradient(0, 0, w, 0);
    hGrad.addColorStop(0, '#FFFFFF');
    hGrad.addColorStop(1, hueToColor(hsv.h));
    ctx.fillStyle = hGrad;
    ctx.fillRect(0, 0, w, h);

    // Black vertical gradient overlay
    const vGrad = ctx.createLinearGradient(0, 0, 0, h);
    vGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vGrad.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = vGrad;
    ctx.fillRect(0, 0, w, h);
  }, [hsv.h]);

  // ── Draw Hue bar ──
  const drawHue = useCallback(() => {
    const canvas = hueRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    for (let i = 0; i <= 6; i++) {
      grad.addColorStop(i / 6, hueToColor(i * 60));
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, canvas.height);
  }, []);

  // ── Draw Alpha bar ──
  const drawAlpha = useCallback(() => {
    const canvas = alphaRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;

    // Checkerboard
    const size = 6;
    for (let x = 0; x < w; x += size) {
      for (let y = 0; y < h; y += size) {
        ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? '#444' : '#333';
        ctx.fillRect(x, y, size, size);
      }
    }

    const currentColor = hsvToHex(hsv.h, hsv.s, hsv.v);
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, currentColor + '00');
    grad.addColorStop(1, currentColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }, [hsv]);

  useEffect(() => { drawSatVal(); }, [drawSatVal]);
  useEffect(() => { drawHue(); }, [drawHue]);
  useEffect(() => { drawAlpha(); }, [drawAlpha]);

  // ── Interaction handlers ──
  const emitChange = useCallback((newHsv: { h: number; s: number; v: number }) => {
    const hex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
    setHexInput(hex.replace('#', ''));
    onChange(hex);
  }, [onChange]);

  const handleSVInteraction = useCallback((clientX: number, clientY: number) => {
    const canvas = satValRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const s = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const v = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
    const newHsv = { ...hsv, s, v };
    setHsv(newHsv);
    emitChange(newHsv);
  }, [hsv, emitChange]);

  const handleHueInteraction = useCallback((clientX: number) => {
    const canvas = hueRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const h = Math.max(0, Math.min(360, ((clientX - rect.left) / rect.width) * 360));
    const newHsv = { ...hsv, h };
    setHsv(newHsv);
    emitChange(newHsv);
  }, [hsv, emitChange]);

  const handleAlphaInteraction = useCallback((clientX: number) => {
    const canvas = alphaRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const a = Math.max(0, Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100)));
    onOpacityChange(a);
  }, [onOpacityChange]);

  // ── Global mouse events for drag ──
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSV.current) handleSVInteraction(e.clientX, e.clientY);
      if (isDraggingHue.current) handleHueInteraction(e.clientX);
      if (isDraggingAlpha.current) handleAlphaInteraction(e.clientX);
    };
    const handleMouseUp = () => {
      isDraggingSV.current = false;
      isDraggingHue.current = false;
      isDraggingAlpha.current = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleSVInteraction, handleHueInteraction, handleAlphaInteraction]);

  const handleHexSubmit = (value: string) => {
    const cleaned = value.replace('#', '').slice(0, 6);
    setHexInput(cleaned);
    if (/^[0-9A-Fa-f]{6}$/.test(cleaned)) {
      const hex = `#${cleaned}`;
      const newHsv = hexToHsv(hex);
      setHsv(newHsv);
      onChange(hex);
    }
  };

  // ── Indicator positions ──
  const svX = hsv.s * 100;
  const svY = (1 - hsv.v) * 100;
  const hueX = (hsv.h / 360) * 100;
  const alphaX = opacity;

  return (
    <div className="w-[240px] bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 p-3 space-y-3 select-none z-[300]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-white border-b-2 border-white pb-0.5">Custom</span>
          <span className="text-[10px] font-bold text-white/30 cursor-pointer hover:text-white/50 transition-colors">Libraries</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-md text-white/30 hover:text-white transition-all">
          <X size={14} />
        </button>
      </div>

      {/* Saturation / Value Area */}
      <div className="relative rounded-xl overflow-hidden cursor-crosshair" style={{ height: 160 }}>
        <canvas
          ref={satValRef}
          width={240}
          height={160}
          className="w-full h-full block"
          onMouseDown={(e) => { isDraggingSV.current = true; handleSVInteraction(e.clientX, e.clientY); }}
        />
        {/* Indicator */}
        <div
          className="absolute w-4 h-4 rounded-full border-2 border-white shadow-[0_0_4px_rgba(0,0,0,0.8)] pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${svX}%`, top: `${svY}%`, backgroundColor: hsvToHex(hsv.h, hsv.s, hsv.v) }}
        />
      </div>

      {/* Hue Slider */}
      <div className="relative h-3 rounded-full overflow-hidden cursor-pointer">
        <canvas
          ref={hueRef}
          width={240}
          height={12}
          className="w-full h-full block rounded-full"
          onMouseDown={(e) => { isDraggingHue.current = true; handleHueInteraction(e.clientX); }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-[0_0_4px_rgba(0,0,0,0.5)] pointer-events-none"
          style={{ left: `${hueX}%`, backgroundColor: hueToColor(hsv.h) }}
        />
      </div>

      {/* Alpha Slider */}
      <div className="relative h-3 rounded-full overflow-hidden cursor-pointer">
        <canvas
          ref={alphaRef}
          width={240}
          height={12}
          className="w-full h-full block rounded-full"
          onMouseDown={(e) => { isDraggingAlpha.current = true; handleAlphaInteraction(e.clientX); }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-[0_0_4px_rgba(0,0,0,0.5)] pointer-events-none"
          style={{ left: `${alphaX}%`, backgroundColor: hsvToHex(hsv.h, hsv.s, hsv.v) }}
        />
      </div>

      {/* Hex + Opacity Inputs */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-white/5 border border-white/5 rounded-lg px-2 py-1.5 flex-1">
          <span className="text-[9px] text-white/30 font-bold mr-1.5">Hex</span>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexSubmit(e.target.value)}
            maxLength={6}
            className="bg-transparent flex-1 text-[11px] text-white font-mono font-bold outline-none w-0"
          />
        </div>
        <div className="flex items-center bg-white/5 border border-white/5 rounded-lg px-2 py-1.5 w-16">
          <input
            type="number"
            min={0}
            max={100}
            value={opacity}
            onChange={(e) => onOpacityChange(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
            className="bg-transparent text-[11px] text-white font-mono font-bold outline-none w-full text-center"
          />
          <span className="text-[9px] text-white/30 ml-0.5">%</span>
        </div>
      </div>

      {/* On This Page */}
      <div className="space-y-2 pt-1 border-t border-white/5">
        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">On this page</span>
        <div className="flex flex-wrap gap-1">
          {PAGE_COLORS.map((c, i) => (
            <button
              key={i}
              onClick={() => { const newHsv = hexToHsv(c); setHsv(newHsv); setHexInput(c.replace('#', '')); onChange(c); }}
              className="w-5 h-5 rounded border border-white/10 hover:border-white/40 hover:scale-110 transition-all"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
