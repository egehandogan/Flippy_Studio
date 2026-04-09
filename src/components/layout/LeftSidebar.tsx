import React from 'react';
import { useSceneGraph } from '../../hooks/useSceneGraph';
import { bridgeService } from '../../services/BridgeService';
import { 
  Search, 
  Layers as LayersIcon, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  ChevronDown, 
  Maximize, 
  Settings2
} from 'lucide-react';

const LeftSidebar: React.FC<{ onOpenPush: () => void }> = ({ onOpenPush }) => {
  const sceneGraph = useSceneGraph();
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

  return (
    <aside className="w-72 bg-black border-r border-white/5 flex flex-col overflow-hidden z-40">
      {/* Game Engine Editor Section */}
      <div className="p-4 border-b border-white/5 bg-white/[0.01]">
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
                
                {/* Live Sync Pill */}
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

        {/* Layer Search Area from Image 1 */}
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
          {sceneGraph.assets.slice().reverse().map((asset) => (
            <div 
              key={asset.id}
              onClick={() => sceneGraph.selectAsset(asset.id)}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all mb-0.5 ${
                sceneGraph.selectedAssetIds.has(asset.id) 
                  ? 'bg-flippy-blue/[0.12] text-flippy-blue' 
                  : 'text-white/40 hover:bg-white/[0.04] hover:text-white/80'
              }`}
            >
              <ChevronDown size={14} className={`transition-transform grow-0 shrink-0 ${asset.parentId ? 'opacity-0' : 'opacity-40'}`} />
              <LayersIcon size={14} className="shrink-0 opacity-40" />
              <span className="flex-1 text-[11px] font-bold truncate tracking-tight">{asset.name}</span>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    sceneGraph.updateAsset(asset.id, { visible: !asset.visible });
                  }}
                  className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                >
                  {asset.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    sceneGraph.updateAsset(asset.id, { locked: !asset.locked });
                  }}
                  className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                >
                  {asset.locked ? <Lock size={12} /> : <Unlock size={12} />}
                </button>
              </div>
            </div>
          ))}

          {sceneGraph.assets.length === 0 && (
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
