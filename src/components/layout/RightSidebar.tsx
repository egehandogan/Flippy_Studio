import React from 'react';
import { useSceneStore } from '../../store/useSceneStore';
import { 
  Square, 
  Circle, 
  Type, 
  Image as ImageIcon, 
  Layers, 
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic
} from 'lucide-react';

const PropertyGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="py-4 border-b border-white/5 space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{label}</span>
      <ChevronDown size={12} className="text-white/20" />
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const Input = ({ label, value, onChange, type = "text", icon: Icon }: any) => (
  <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-lg px-2 py-1.5 focus-within:border-flippy-blue/50 transition-all">
    {Icon && <Icon size={14} className="text-white/20" />}
    <div className="flex flex-col flex-1">
      {label && <span className="text-[8px] text-white/20 uppercase font-bold">{label}</span>}
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-[11px] text-white outline-none w-full font-medium"
      />
    </div>
  </div>
);

const RightSidebar: React.FC = () => {
  const { assets, selectedIds, updateAsset } = useSceneStore();
  const selectedAsset = assets.find(a => selectedIds.includes(a.id));

  if (!selectedAsset) {
    return (
      <aside className="w-64 border-l border-white/5 bg-[#0D0D0D] flex flex-col p-4">
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center opacity-20">
          <Layers size={32} />
          <div className="text-[11px] font-medium max-w-[120px]">Select an asset to view properties</div>
        </div>
      </aside>
    );
  }

  const handlePropChange = (key: string, value: any) => {
    updateAsset(selectedAsset.id, {
      properties: { ...selectedAsset.properties, [key]: value }
    });
  };

  return (
    <aside className="w-64 border-l border-white/5 bg-[#0D0D0D] flex flex-col overflow-y-auto custom-scrollbar">
      {/* Selection Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          {selectedAsset.type === 'rect' && <Square size={14} className="text-flippy-blue" />}
          {selectedAsset.type === 'circle' && <Circle size={14} className="text-flippy-blue" />}
          {selectedAsset.type === 'text' && <Type size={14} className="text-flippy-blue" />}
          {selectedAsset.type === 'image' && <ImageIcon size={14} className="text-flippy-blue" />}
          <span className="text-[11px] font-bold text-white truncate max-w-[100px]">{selectedAsset.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => updateAsset(selectedAsset.id, { visible: !selectedAsset.visible })}
            className="p-1.5 hover:bg-white/5 rounded-md text-white/40 hover:text-white transition-all"
          >
            {selectedAsset.visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button 
            onClick={() => updateAsset(selectedAsset.id, { locked: !selectedAsset.locked })}
            className="p-1.5 hover:bg-white/5 rounded-md text-white/40 hover:text-white transition-all"
          >
            {selectedAsset.locked ? <Lock size={14} /> : <Unlock size={14} />}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {/* Transform Group */}
        <PropertyGroup label="Transform">
          <div className="grid grid-cols-2 gap-2">
            <Input label="X" value={Math.round(selectedAsset.x)} onChange={(v: any) => updateAsset(selectedAsset.id, { x: parseInt(v) || 0 })} />
            <Input label="Y" value={Math.round(selectedAsset.y)} onChange={(v: any) => updateAsset(selectedAsset.id, { y: parseInt(v) || 0 })} />
            <Input label="W" value={Math.round(selectedAsset.width)} onChange={(v: any) => updateAsset(selectedAsset.id, { width: parseInt(v) || 5 })} />
            <Input label="H" value={Math.round(selectedAsset.height)} onChange={(v: any) => updateAsset(selectedAsset.id, { height: parseInt(v) || 5 })} />
          </div>
          <Input label="Rotation" value={Math.round(selectedAsset.rotation)} onChange={(v: any) => updateAsset(selectedAsset.id, { rotation: parseInt(v) || 0 })} />
        </PropertyGroup>

        {/* Text Properties - Conditional */}
        {selectedAsset.type === 'text' && (
          <PropertyGroup label="Typography">
            <div className="space-y-2">
              <select 
                value={selectedAsset.properties.fontFamily || 'Inter, sans-serif'}
                onChange={(e) => handlePropChange('fontFamily', e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-lg px-2 py-2 text-[11px] text-white outline-none focus:border-flippy-blue/50"
              >
                <option value="Inter, sans-serif">Inter</option>
                <option value="Roboto, sans-serif">Roboto</option>
                <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
                <option value="monospace">Monospace</option>
              </select>
              
              <div className="grid grid-cols-2 gap-2">
                <Input label="Size" type="number" value={selectedAsset.properties.fontSize || 16} onChange={(v: any) => handlePropChange('fontSize', parseInt(v) || 1)} />
                <Input label="Line H" type="number" value={selectedAsset.properties.lineHeight || 1.2} onChange={(v: any) => handlePropChange('lineHeight', parseFloat(v) || 1)} />
              </div>

              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                {[
                  { id: 'left', icon: AlignLeft },
                  { id: 'center', icon: AlignCenter },
                  { id: 'right', icon: AlignRight }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handlePropChange('textAlign', item.id)}
                    className={`flex-1 flex items-center justify-center p-1.5 rounded-md transition-all ${
                      selectedAsset.properties.textAlign === item.id ? 'bg-flippy-blue text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={14} />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePropChange('fontWeight', selectedAsset.properties.fontWeight === 'bold' ? 'normal' : 'bold')}
                  className={`flex-1 h-9 flex items-center justify-center border border-white/5 rounded-lg transition-all ${
                    selectedAsset.properties.fontWeight === 'bold' ? 'bg-white text-black font-bold' : 'bg-white/5 text-white/40 hover:text-white'
                  }`}
                >
                  <Bold size={14} />
                </button>
                <button
                  onClick={() => handlePropChange('fontStyle', selectedAsset.properties.fontStyle === 'italic' ? 'normal' : 'italic')}
                  className={`flex-1 h-9 flex items-center justify-center border border-white/5 rounded-lg transition-all ${
                    selectedAsset.properties.fontStyle === 'italic' ? 'bg-white text-black italic' : 'bg-white/5 text-white/40 hover:text-white'
                  }`}
                >
                  <Italic size={14} />
                </button>
              </div>
            </div>
          </PropertyGroup>
        )}

        {/* Appearance Group */}
        <PropertyGroup label="Appearance">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div 
                className="w-full h-9 rounded-lg border border-white/10 flex items-center px-3 gap-3 bg-white/5 hover:bg-white/10 transition-all cursor-pointer overflow-hidden"
              >
                <div 
                  className="w-4 h-4 rounded-sm border border-white/20 shrink-0" 
                  style={{ backgroundColor: selectedAsset.properties.fill || '#FFFFFF' }}
                />
                <input 
                  type="text" 
                  value={selectedAsset.properties.fill || '#FFFFFF'} 
                  onChange={(e) => handlePropChange('fill', e.target.value)}
                  className="bg-transparent text-[11px] text-white outline-none w-full font-mono font-bold"
                />
              </div>
            </div>
            <Input label="Opacity %" type="number" value={selectedAsset.properties.opacity || 100} onChange={(v: any) => handlePropChange('opacity', Math.min(100, Math.max(0, parseInt(v) || 0)))} />
          </div>
        </PropertyGroup>
      </div>

      <div className="mt-auto p-4 border-t border-white/5">
        <div className="flex items-center justify-between text-[10px] text-white/20 uppercase font-black tracking-widest">
          <span>Asset UUID</span>
          <span className="font-mono">{selectedAsset.id.slice(0, 8)}...</span>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
