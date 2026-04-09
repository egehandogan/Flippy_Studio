import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  MousePointer2, 
  Square, 
  Circle, 
  Type, 
  Box, 
  Globe, 
  PenTool, 
  Hand, 
  MessageSquare, 
  Maximize2, 
  ChevronDown,
  GripVertical,
  Download
} from 'lucide-react';
import { useEditorState } from '../../hooks/useEditorState';
import type { ToolType } from '../../services/EditorService';
import { FlippyAsset, sceneGraph } from '../../core/SceneGraph';

const Toolbar: React.FC = () => {
  const { activeTool, setTool, zoom } = useEditorState();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tools: { id: ToolType; icon: React.ReactNode; label: string }[] = [
    { id: 'add', icon: <Plus size={18} />, label: 'Importer' },
    { id: 'cursor', icon: <MousePointer2 size={18} />, label: 'Cursor' },
    { id: 'rect', icon: <Square size={18} />, label: 'Rectangle' },
    { id: 'circle', icon: <Circle size={18} />, label: 'Circle' },
    { id: 'text', icon: <Type size={18} />, label: 'Text' },
    { id: 'cube', icon: <Box size={18} />, label: '3D Cube' },
    { id: 'sphere', icon: <Globe size={18} />, label: '3D Sphere' },
    { id: 'pen', icon: <PenTool size={18} />, label: 'Pen Tool' },
    { id: 'pan', icon: <Hand size={18} />, label: 'Pan' },
    { id: 'comment', icon: <MessageSquare size={18} />, label: 'Comment' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const asset = new FlippyAsset('image', 100, 100, {
            width: img.width / 4,
            height: img.height / 4,
            imageElement: img,
            src: img.src,
            name: file.name
          });
          sceneGraph.addAsset(asset);
          sceneGraph.selectAsset(asset.id);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToolClick = (toolId: ToolType) => {
    if (toolId === 'add') {
      fileInputRef.current?.click();
    } else {
      setTool(toolId);
    }
  };

  return (
    <motion.div 
      drag
      dragMomentum={false}
      className="flex items-center gap-1 p-1.5 bg-[#0D0D0D]/80 backdrop-blur-2xl border border-white/10 rounded-[24px] shadow-2xl z-50 select-none cursor-default active:cursor-grabbing"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />

      {/* Drag Handle */}
      <div className="w-6 h-10 flex items-center justify-center cursor-grab active:cursor-grabbing text-white/20 hover:text-white/40 border-r border-white/5 mr-1">
        <GripVertical size={14} />
      </div>

      {/* Tool Group */}
      <div className="flex items-center gap-1 pr-2 border-r border-white/10">
        {tools.map(tool => (
          <button
            key={tool.id}
            title={tool.label}
            onClick={() => handleToolClick(tool.id)}
            className={`tool-btn w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
              activeTool === tool.id 
                ? 'bg-flippy-blue text-white shadow-[0_0_15px_-5px_#0094FF]' 
                : 'text-white/40 hover:bg-white/5 hover:text-white/60'
            }`}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* View/Export Group */}
      <div className="flex items-center gap-1 pl-2 pr-1 relative">
        <button 
          onClick={() => setTool('size')}
          className="tool-btn w-10 h-10 flex items-center justify-center rounded-xl text-white/40 hover:bg-white/5"
          title="Auto Zoom"
        >
          <Maximize2 size={18} />
        </button>
        <div className="flex items-center gap-2 px-3 h-10 text-white/60 text-[11px] font-bold font-mono">
          {zoom}%
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="tool-btn px-5 h-10 flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/80 text-[11px] font-bold rounded-xl transition-all border border-white/5"
          >
            <Download size={14} />
            Export
            <ChevronDown size={12} className={`transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
          </button>

          {isExportOpen && (
            <div className="absolute bottom-full mb-3 right-0 w-64 bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 z-[100]">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest pl-1">Export Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {['x1', 'x2', 'x4'].map(s => (
                    <button key={s} className="h-8 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-white/60">{s}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest pl-1">File Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['PNG', 'JPEG', 'SVG', 'Bitmap'].map(t => (
                    <button key={t} className="h-8 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-white/60">{t}</button>
                  ))}
                </div>
              </div>
              <button 
                className="w-full h-10 bg-flippy-blue hover:bg-flippy-blue/90 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_-5px_#0094FF]"
                onClick={() => setIsExportOpen(false)}
              >
                Download
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Toolbar;
