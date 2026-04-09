import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import * as Tooltip from '@radix-ui/react-tooltip';
import { 
  Plus, 
  MousePointer2, 
  Square, 
  Circle, 
  Type, 
  Component, 
  Globe, 
  PenTool, 
  Hand, 
  MessageSquare, 
  GripVertical,
  Download
} from 'lucide-react';
import { useEditorStore, type ToolType } from '../../store/useEditorStore';
import { useSceneStore } from '../../store/useSceneStore';

const ToolbarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, shortcut, isActive, onClick }) => {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            onClick={onClick}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-150 ${
              isActive 
                ? 'bg-flippy-blue text-white shadow-[0_0_15px_-5px_#0095FF]' 
                : 'text-white/40 hover:bg-[#2C2C2C] hover:text-white'
            }`}
          >
            {icon}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="select-none rounded-md bg-[#111] border border-white/10 px-3 py-1.5 text-[11px] font-bold text-white shadow-xl animate-in fade-in zoom-in-95 duration-200 z-[100]"
            sideOffset={5}
            side="top"
          >
            <div className="flex items-center gap-2">
              {label}
              {shortcut && <span className="text-white/30 px-1.5 py-0.5 bg-white/5 rounded text-[9px]">{shortcut}</span>}
            </div>
            <Tooltip.Arrow className="fill-[#111]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

const Toolbar: React.FC = () => {
  const { activeTool, setTool, zoom } = useEditorStore();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addAsset = useSceneStore((state) => state.addAsset);
  const selectAssets = useSceneStore((state) => state.selectAssets);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const id = crypto.randomUUID();
          const newAsset = {
            id,
            type: 'image' as const,
            x: 100,
            y: 100,
            width: img.width / 2,
            height: img.height / 2,
            rotation: 0,
            name: file.name,
            visible: true,
            locked: false,
            parentId: null,
            properties: {
              src: img.src,
              opacity: 100,
            }
          };
          addAsset(newAsset);
          selectAssets([id]);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const tools: { id: ToolType; icon: React.ReactNode; label: string; shortcut?: string }[] = [
    { id: 'add', icon: <Plus size={18} />, label: 'Importer' },
    { id: 'cursor', icon: <MousePointer2 size={18} />, label: 'Select', shortcut: 'V' },
    { id: 'rect', icon: <Square size={18} />, label: 'Rectangle', shortcut: 'R' },
    { id: 'circle', icon: <Circle size={18} />, label: 'Ellipse', shortcut: 'O' },
    { id: 'text', icon: <Type size={18} />, label: 'Text', shortcut: 'T' },
    { id: 'component', icon: <Component size={18} />, label: 'Components', shortcut: 'Alt+C' },
    { id: 'prototype', icon: <Globe size={18} />, label: 'Prototype', shortcut: 'P' },
    { id: 'pen', icon: <PenTool size={18} />, label: 'Pen', shortcut: 'P' },
    { id: 'pan', icon: <Hand size={18} />, label: 'Hand', shortcut: 'H' },
    { id: 'comment', icon: <MessageSquare size={18} />, label: 'Comment', shortcut: 'C' },
  ];

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
      className="flex items-center gap-1.5 p-1.5 bg-[#0D0D0D]/90 backdrop-blur-2xl border border-white/10 rounded-[20px] shadow-2xl z-50 select-none cursor-default"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />

      {/* Drag Handle */}
      <div className="w-5 h-10 flex items-center justify-center cursor-grab active:cursor-grabbing text-white/10 hover:text-white/20">
        <GripVertical size={14} />
      </div>

      <div className="flex items-center gap-1 pr-2 border-r border-white/5">
        {tools.map(tool => (
          <ToolbarItem
            key={tool.id}
            icon={tool.icon}
            label={tool.label}
            shortcut={tool.shortcut}
            isActive={activeTool === tool.id}
            onClick={() => handleToolClick(tool.id)}
          />
        ))}
      </div>

      <div className="flex items-center gap-1.5 pl-1.5 pr-1">
        <div className="flex items-center gap-2 px-3 h-10 text-white/40 text-[11px] font-bold font-mono">
          {Math.round(zoom * 100)}%
        </div>
        
        <button 
          onClick={() => setIsExportOpen(!isExportOpen)}
          className="px-5 h-10 flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/80 text-[11px] font-bold rounded-xl transition-all border border-white/5"
        >
          <Download size={14} />
          Export
        </button>
      </div>
    </motion.div>
  );
};

export default Toolbar;
