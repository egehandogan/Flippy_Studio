import React from 'react';
import { useSceneGraph } from '../../hooks/useSceneGraph';
import { 
  AlignLeft, AlignCenter, AlignRight, AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  Eye, EyeOff, Lock, Unlock, ChevronDown, Plus, MoreHorizontal, Target
} from 'lucide-react';

const RightSidebar: React.FC = () => {
  const scene = useSceneGraph();
  const selectedIds = Array.from(scene.selectedAssetIds);
  const selectedAssets = selectedIds.map(id => scene.assets.find(a => a.id === id)).filter(Boolean);
  const firstAsset = selectedAssets[0];

  if (!firstAsset) {
    return (
      <aside className="w-64 border-l border-white/5 bg-[#0a0a0a] flex flex-col items-center justify-center text-white/10 text-[10px] uppercase font-bold tracking-[0.2em] space-y-4 select-none">
        <Target size={24} className="opacity-20 animate-pulse" />
        <span>Select an asset</span>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-l border-white/5 bg-[#0A0A0A] flex flex-col z-40 overflow-y-auto custom-scrollbar select-none text-white/90">
      {/* Header / Group Selection */}
      <div className="h-11 border-b border-white/5 flex items-center justify-between px-3 shrink-0 bg-white/[0.01]">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="text-[11px] font-bold truncate max-w-[120px]">{firstAsset.name}</span>
          <ChevronDown size={14} className="text-white/20" />
        </div>
        <div className="flex items-center gap-1">
          <IconButton icon={<MoreHorizontal size={14} />} />
        </div>
      </div>

      <div className="flex-1">
        {/* Alignment */}
        <div className="p-2 border-b border-white/5 flex items-center justify-around">
          <AlignButton icon={<AlignLeft size={16} />} onClick={() => scene.alignAssets('align-left')} />
          <AlignButton icon={<AlignCenter size={16} />} onClick={() => scene.alignAssets('align-h-center')} />
          <AlignButton icon={<AlignRight size={16} />} onClick={() => scene.alignAssets('align-right')} />
          <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
          <AlignButton icon={<AlignStartVertical size={16} />} onClick={() => scene.alignAssets('align-top')} />
          <AlignButton icon={<AlignCenterVertical size={16} />} onClick={() => scene.alignAssets('align-v-center')} />
          <AlignButton icon={<AlignEndVertical size={16} />} onClick={() => scene.alignAssets('align-bottom')} />
        </div>

        {/* Position & Layout */}
        <div className="p-3 border-b border-white/5 grid grid-cols-2 gap-x-4 gap-y-3">
          <PropertyInput label="X" value={Math.round(firstAsset.x)} onChange={(v) => scene.updateAsset(firstAsset.id, { x: Number(v) })} />
          <PropertyInput label="Y" value={Math.round(firstAsset.y)} onChange={(v) => scene.updateAsset(firstAsset.id, { y: Number(v) })} />
          <PropertyInput label="W" value={Math.round(firstAsset.width)} onChange={(v) => scene.updateAsset(firstAsset.id, { width: Math.max(1, Number(v)) })} />
          <PropertyInput label="H" value={Math.round(firstAsset.height)} onChange={(v) => scene.updateAsset(firstAsset.id, { height: Math.max(1, Number(v)) })} />
          <PropertyInput label="R" value={Math.round(firstAsset.rotation * (180/Math.PI))} unit="°" onChange={(v) => scene.updateAsset(firstAsset.id, { rotation: Number(v) * (Math.PI/180) })} />
          <PropertyInput label="O" value={Math.round(firstAsset.properties.fillOpacity || 100)} unit="%" onChange={(v) => scene.updateAssetProperties(firstAsset.id, { fillOpacity: Number(v) })} />
        </div>

        {/* Appearance */}
        <Section title="Appearance">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <PropertyInput label="Radius" value={firstAsset.properties.cornerRadius || 0} onChange={(v) => scene.updateAssetProperties(firstAsset.id, { cornerRadius: Number(v) })} />
          </div>
        </Section>

        {/* Fill */}
        <Section title="Fill" action={<Plus size={14} className="text-white/40" />}>
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-md border border-white/10 shrink-0 cursor-pointer shadow-inner" 
              style={{ backgroundColor: firstAsset.properties.fill }}
              onClick={() => {
                // Future: Open real color picker
              }}
            />
            <input 
              type="text" 
              className="flex-1 bg-transparent text-[11px] font-mono text-white/80 focus:outline-none uppercase" 
              value={firstAsset.properties.fill?.replace('#', '')}
              onChange={(e) => scene.updateAssetProperties(firstAsset.id, { fill: `#${e.target.value}` })}
            />
            <span className="text-[10px] text-white/40 font-mono">{Math.round(firstAsset.properties.fillOpacity || 100)}%</span>
            <button 
              className="p-1 hover:bg-white/5 rounded text-white/40 transition-all"
              onClick={() => scene.updateAssetProperties(firstAsset.id, { fillHidden: !firstAsset.properties.fillHidden })}
            >
              {firstAsset.properties.fillHidden ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </Section>

        {/* Stroke */}
        <Section title="Stroke" action={<Plus size={14} className="text-white/40" />}>
           <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-md border border-white/10 shrink-0 cursor-pointer" 
                  style={{ backgroundColor: firstAsset.properties.stroke || '#0094FF' }}
                />
                <input 
                  type="text" 
                  className="flex-1 bg-transparent text-[11px] font-mono text-white/80 focus:outline-none uppercase" 
                  value={firstAsset.properties.stroke?.replace('#', '') || '0094FF'}
                  onChange={(e) => scene.updateAssetProperties(firstAsset.id, { stroke: `#${e.target.value}` })}
                />
                <button 
                  className="p-1 hover:bg-white/5 rounded text-white/40 transition-all"
                  onClick={() => scene.updateAssetProperties(firstAsset.id, { strokeHidden: !firstAsset.properties.strokeHidden })}
                >
                  {firstAsset.properties.strokeHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                   <PropertyInput label="Width" value={firstAsset.properties.strokeWidth || 1} onChange={(v) => scene.updateAssetProperties(firstAsset.id, { strokeWidth: Number(v) })} />
                </div>
                <div className="bg-white/5 rounded px-2 h-7 flex items-center text-[10px] text-white/60 font-medium">Inside</div>
              </div>
           </div>
        </Section>
        
        {/* Effects */}
        <Section title="Effects" action={<Plus size={14} className="text-white/40" />} />

        {/* Export */}
        <Section title="Export" action={<Plus size={14} className="text-white/40" />} />
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-white/5 bg-white/[0.01] flex flex-col gap-2">
        <div className="flex items-center justify-between text-[10px] text-white/20 uppercase font-bold tracking-widest">
          <span>Asset Status</span>
          <div className="flex gap-2">
            <IconButton icon={firstAsset.locked ? <Lock size={12} /> : <Unlock size={12} />} onClick={() => scene.updateAsset(firstAsset.id, { locked: !firstAsset.locked })} />
            <IconButton icon={firstAsset.visible ? <Eye size={12} /> : <EyeOff size={12} />} onClick={() => scene.updateAsset(firstAsset.id, { visible: !firstAsset.visible })} />
          </div>
        </div>
      </div>
    </aside>
  );
};

const Section: React.FC<{ title: string; children?: React.ReactNode; action?: React.ReactNode }> = ({ title, children, action }) => (
  <div className="border-b border-white/5">
    <div className="px-3 h-9 flex items-center justify-between group cursor-default">
      <span className="text-[11px] font-bold text-white/40 group-hover:text-white/60 transition-colors uppercase tracking-wider">{title}</span>
      {action && <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">{action}</button>}
    </div>
    {children && <div className="px-3 pb-3 space-y-2">{children}</div>}
  </div>
);

const AlignButton: React.FC<{ icon: React.ReactNode; onClick: () => void }> = ({ icon, onClick }) => (
  <button 
    className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-md text-white/40 hover:text-white transition-all active:scale-95" 
    onClick={onClick}
  >
    {icon}
  </button>
);

const IconButton: React.FC<{ icon: React.ReactNode; onClick?: () => void }> = ({ icon, onClick }) => (
  <button 
    className="p-1.5 hover:bg-white/5 rounded-md text-white/40 hover:text-white transition-all active:scale-95" 
    onClick={onClick}
  >
    {icon}
  </button>
);

const PropertyInput: React.FC<{ label: string; value: number | string; unit?: string; onChange: (val: string) => void }> = ({ label, value, unit, onChange }) => (
  <div className="flex items-center gap-2 group">
    <span className="text-[10px] font-bold text-white/20 group-hover:text-white/40 transition-colors w-3">{label}</span>
    <div className="relative flex-1">
      <input 
        type="text" 
        className="w-full h-7 bg-transparent border border-transparent hover:border-white/10 focus:border-flippy-blue/20 rounded-md px-1 text-[11px] font-mono text-white/80 focus:outline-none transition-all" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {unit && <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-white/20 font-bold">{unit}</span>}
    </div>
  </div>
);

export default RightSidebar;
