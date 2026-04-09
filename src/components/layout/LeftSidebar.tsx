import React, { useState } from 'react';
import { useSceneStore, type Asset } from '../../store/useSceneStore';
import { bridgeService } from '../../services/BridgeService';
import { 
  Search, 
  Layers as LayersIcon, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  ChevronDown, 
  ChevronRight,
  Maximize, 
  Settings2,
  Square,
  Circle as CircleIcon,
  Type,
  Image as ImageIcon
} from 'lucide-react';

const AssetIcon = ({ type }: { type: Asset['type'] }) => {
  switch (type) {
    case 'rect': return <Square size={12} className="opacity-40" />;
    case 'circle': return <CircleIcon size={12} className="opacity-40" />;
    case 'text': return <Type size={12} className="opacity-40" />;
    case 'image': return <ImageIcon size={12} className="opacity-40" />;
    case 'frame': return <LayersIcon size={12} className="text-flippy-blue opacity-60" />;
    default: return <Square size={12} className="opacity-40" />;
  }
};

const LayerItem: React.FC<{
  asset: Asset;
  level: number;
  expandedIds: string[];
  toggleExpand: (id: string) => void;
  selectedIds: string[];
  selectAssets: (ids: string[]) => void;
  updateAsset: (id: string, props: Partial<Asset>) => void;
  allAssets: Asset[];
}> = ({ asset, level, expandedIds, toggleExpand, selectedIds, selectAssets, updateAsset, allAssets }) => {
  const isExpanded = expandedIds.includes(asset.id);
  const children = allAssets.filter(a => a.parentId === asset.id);
  const hasChildren = children.length > 0;
  const isSelected = selectedIds.includes(asset.id);

  return (
    <>
      <div 
        onClick={(e) => {
          e.stopPropagation();
          selectAssets([asset.id]);
        }}
        className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all mb-0.5 ${
          isSelected 
            ? 'bg-flippy-blue/[0.12] text-flippy-blue' 
            : 'text-white/40 hover:bg-white/[0.04] hover:text-white/80'
        }`}
        style={{ paddingLeft: `${(level * 16) + 8}px` }}
      >
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) toggleExpand(asset.id);
          }}
          className="w-4 h-4 flex items-center justify-center hover:bg-white/5 rounded transition-colors"
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
          ) : null}
        </div>
        
        <AssetIcon type={asset.type} />
        <span className={`flex-1 text-[11px] truncate tracking-tight ${isSelected ? 'font-bold' : 'font-medium'}`}>
          {asset.name}
        </span>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              updateAsset(asset.id, { visible: !asset.visible });
            }}
            className="p-1 hover:bg-white/5 rounded-md transition-colors"
          >
            {asset.visible ? <Eye size={10} /> : <EyeOff size={10} />}
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              updateAsset(asset.id, { locked: !asset.locked });
            }}
            className="p-1 hover:bg-white/5 rounded-md transition-colors"
          >
            {asset.locked ? <Lock size={10} /> : <Unlock size={10} />}
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="flex flex-col">
          {children.slice().reverse().map(child => (
            <LayerItem 
              key={child.id}
              asset={child}
              level={level + 1}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              selectedIds={selectedIds}
              selectAssets={selectAssets}
              updateAsset={updateAsset}
              allAssets={allAssets}
            />
          ))}
        </div>
      )}
    </>
  );
};

const LeftSidebar: React.FC<{ onOpenPush: () => void }> = ({ onOpenPush }) => {
  const assets = useSceneStore((state) => state.assets);
  const selectedIds = useSceneStore((state) => state.selectedIds);
  const updateAsset = useSceneStore((state) => state.updateAsset);
  const selectAssets = useSceneStore((state) => state.selectAssets);
  
  // Track expanded frames/groups - default frames expanded
  const [expandedIds, setExpandedIds] = useState<string[]>(
    assets.filter(a => a.type === 'frame').map(a => a.id)
  );

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const bridge = bridgeService.state;

  const engines = [
    { id: 'unity', name: 'Unity', icon: <img src="/unity_logo.png" className="w-5 h-5 object-contain" alt="Unity" /> },
    { id: 'unreal', name: 'Unreal', icon: <img src="/unreal_logo.png" className="w-5 h-5 object-contain" alt="Unreal" /> },
    { id: 'godot', name: 'Godot', icon: <img src="/godot_logo.png" className="w-5 h-5 object-contain" alt="Godot" /> },
  ];

  const handleEngineClick = (id: string) => {
    if (bridge.connectedEngine === id) {
      onOpenPush();
    } else {
      bridgeService.setPendingEngine(id as any);
    }
  };

  // Only top-level assets for the main recursive call
  const rootAssets = assets.filter(a => a.parentId === null);

  return (
    <aside className="w-72 flippy-glass flex flex-col overflow-hidden z-40">
      {/* Game Engine Editor Section */}
      <div className="p-4 border-b border-white/5 bg-white/[0.03]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] pl-1">Game Engine Editor</h3>
          <Settings2 size={12} className="text-white/20 cursor-pointer hover:text-white transition-colors" />
        </div>
        
        <div className="flex gap-2 h-20">
          {engines.map(engine => {
            const isConnected = bridge.connectedEngine === engine.id;
            return (
              <button
                key={engine.id}
                onClick={() => handleEngineClick(engine.id)}
                className={`flex-1 flex flex-col items-center justify-center rounded-xl border transition-all relative overflow-hidden group ${
                  isConnected 
                    ? 'bg-flippy-blue/[0.08] border-flippy-blue/30' 
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                }`}
              >
                <div className={`mb-2 opacity-60 group-hover:opacity-100 transition-opacity ${isConnected ? 'text-flippy-blue opacity-100' : ''}`}>
                   {engine.icon}
                </div>
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{engine.name}</span>
                
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <div className={`w-1 h-1 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-white/10'}`}></div>
                  {isConnected && <span className="text-[7px] text-green-500/80 font-bold">LIVE</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Layers Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] pl-1">Layers</h3>
          </div>
          <div className="flex items-center gap-2">
            <Search size={12} className="text-white/20 cursor-pointer hover:text-white transition-colors" />
            <Maximize size={12} className="text-white/20 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>

        <div className="px-4 mb-3">
          <div className="relative group">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/40" />
            <input 
              type="text" 
              placeholder="Search layers..." 
              className="w-full h-8 bg-white/[0.03] border border-white/5 rounded-lg pl-8 pr-3 text-[10px] text-white/60 focus:outline-none focus:border-white/10 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4">
          {rootAssets.slice().reverse().map((asset) => (
            <LayerItem 
              key={asset.id}
              asset={asset}
              level={0}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              selectedIds={selectedIds}
              selectAssets={selectAssets}
              updateAsset={updateAsset}
              allAssets={assets}
            />
          ))}

          {assets.length === 0 && (
            <div className="h-40 flex flex-col items-center justify-center text-white/[0.03] space-y-3">
              <LayersIcon size={32} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">No Layers</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;
