import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Settings, 
  Monitor, 
  Layers, 
  Cpu, 
  Zap, 
  Shield, 
  Users,
  Eye,
  Check
} from 'lucide-react';
import Modal from '../shared/Modal';
import { useEditorStore } from '../../store/useEditorStore';
import { bridgeService } from '../../services/BridgeService';

type Category = 'General' | 'Editor' | 'Project' | 'Engine' | 'AI' | 'Accessibility' | 'Account';

const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('General');
  const { preferences, setPreference } = useEditorStore();
  const bridge = bridgeService.state;

  // Fix impure Math.random in render
  const sessionID = useMemo(() => Math.random().toString(16).substring(2, 10).toUpperCase(), []);

  const categories: { id: Category; icon: React.ReactNode }[] = [
    { id: 'General', icon: <Settings size={14} /> },
    { id: 'Editor', icon: <Layers size={14} /> },
    { id: 'Project', icon: <Monitor size={14} /> },
    { id: 'Engine', icon: <Zap size={14} /> },
    { id: 'AI', icon: <Cpu size={14} /> },
    { id: 'Accessibility', icon: <Eye size={14} /> },
    { id: 'Account', icon: <Users size={14} /> },
  ];

  const renderContent = () => {
    switch (activeCategory) {
      case 'General':
        return (
          <div className="space-y-8">
            <header>
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">General Preferences</h3>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Application-wide configuration.</p>
            </header>
            
            <div className="space-y-6">
              <section className="space-y-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Appearance & Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['deep-dark', 'midnight', 'oled'] as const).map((t) => (
                    <button 
                      key={t}
                      onClick={() => setPreference('theme', t)}
                      className={`h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                        preferences.theme === t 
                          ? 'border-white text-white bg-white/5' 
                          : 'border-white/5 text-white/30 hover:border-white/10 hover:text-white/60'
                      }`}
                    >
                      {t.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">System Language</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['en', 'tr', 'de', 'jp'] as const).map((l) => (
                    <button 
                      key={l}
                      onClick={() => setPreference('language', l)}
                      className={`h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                        preferences.language === l
                          ? 'border-white text-white bg-white/5' 
                          : 'border-white/5 text-white/30 hover:border-white/10 hover:text-white/60'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        );

      case 'Editor':
        return (
          <div className="space-y-8">
             <header>
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Editor Workflow</h3>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Canvas behavior and precision tools.</p>
            </header>

            <div className="space-y-6">
               <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div>
                    <div className="text-[11px] font-black text-white uppercase tracking-widest">Auto Save Engine</div>
                    <div className="text-[9px] text-white/30 uppercase mt-0.5">Protect your progress automatically.</div>
                  </div>
                  <button 
                    onClick={() => setPreference('autoSaveEnabled', !preferences.autoSaveEnabled)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${preferences.autoSaveEnabled ? 'bg-white' : 'bg-white/10'}`}
                  >
                     <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${preferences.autoSaveEnabled ? 'left-7 bg-black' : 'left-1 bg-white/40'}`} />
                  </button>
               </div>

               <section className="space-y-3">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Auto-Save Interval</label>
                    <span className="text-[10px] font-black text-white">{preferences.autoSaveInterval}m</span>
                 </div>
                 <input 
                   type="range" 
                   min="1" max="60" 
                   value={preferences.autoSaveInterval}
                   onChange={(e) => setPreference('autoSaveInterval', parseInt(e.target.value))}
                   className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                 />
               </section>

               <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Snap to Grid</span>
                    <button onClick={() => setPreference('snapToGrid', !preferences.snapToGrid)} className={preferences.snapToGrid ? 'text-white' : 'text-white/20'}>
                      {preferences.snapToGrid ? <Check size={16} /> : <X size={16} />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Show Rulers</span>
                    <button onClick={() => setPreference('showRulers', !preferences.showRulers)} className={preferences.showRulers ? 'text-white' : 'text-white/20'}>
                      {preferences.showRulers ? <Check size={16} /> : <X size={16} />}
                    </button>
                  </div>
               </div>
            </div>
          </div>
        );

      case 'Engine':
        return (
          <div className="space-y-8">
             <header>
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Engine Bridge</h3>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Game Engine pipeline configuration.</p>
            </header>

            <div className="space-y-6">
               <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Connection Status</div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${bridge.connectedEngine ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-white/10'}`} />
                        <span className="text-xs font-black text-white uppercase tracking-widest">
                          {bridge.connectedEngine ? `Linked to ${bridge.connectedEngine}` : 'No Core Connected'}
                        </span>
                     </div>
                     <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">ID: {sessionID}</span>
                  </div>
               </div>

               <section className="space-y-3">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">GitHub Repository</label>
                  <input 
                    type="text" 
                    readOnly
                    value={bridge.githubLink || 'Not connected'}
                    className="w-full h-11 bg-black border border-white/10 rounded-xl px-4 text-xs text-white/40 font-mono"
                  />
               </section>

               <section className="space-y-3">
                 <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Sync Strategy</label>
                 <div className="grid grid-cols-3 gap-2">
                    {(['live', 'manual', 'batch'] as const).map((s) => (
                      <button 
                        key={s}
                        onClick={() => setPreference('syncStrategy', s)}
                        className={`h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                          preferences.syncStrategy === s 
                            ? 'border-white text-white' 
                            : 'border-white/5 text-white/30'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                 </div>
               </section>
            </div>
          </div>
        );

      case 'AI':
        return (
          <div className="space-y-8">
             <header>
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Neural Hub</h3>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Next-gen AI Engine parameters.</p>
            </header>

            <div className="space-y-6">
               <section className="space-y-3">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Active Neural Model</label>
                  <div className="flex flex-col gap-2">
                    {(['gemini-1.5-pro', 'gpt-4o', 'claude-3.5-sonnet'] as const).map((m) => (
                      <button 
                        key={m}
                        onClick={() => setPreference('aiModel', m)}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          preferences.aiModel === m 
                            ? 'border-white bg-white/5' 
                            : 'border-white/5 hover:border-white/10'
                        }`}
                      >
                         <span className={`text-[11px] font-black uppercase tracking-widest ${preferences.aiModel === m ? 'text-white' : 'text-white/40'}`}>{m}</span>
                         {preferences.aiModel === m && <Check size={14} className="text-white" />}
                      </button>
                    ))}
                  </div>
               </section>

               <section className="space-y-3">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Temperature (Creativity)</label>
                    <span className="text-[10px] font-black text-white">{preferences.aiTemperature}</span>
                 </div>
                 <input 
                   type="range" 
                   min="0" max="1" step="0.1"
                   value={preferences.aiTemperature}
                   onChange={(e) => setPreference('aiTemperature', parseFloat(e.target.value))}
                   className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                 />
               </section>
            </div>
          </div>
        );

      case 'Account':
        return (
          <div className="space-y-8">
             <header>
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Account & Quota</h3>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Membership status and resource usage.</p>
            </header>

            <div className="space-y-6">
               <div className="flex items-center justify-between p-6 bg-gradient-to-r from-white/[0.05] to-transparent border border-white/10 rounded-2xl">
                  <div>
                     <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Plan</div>
                     <div className="text-xl font-black text-white uppercase italic tracking-tighter">Studio Pro Edition</div>
                  </div>
                  <Shield size={24} className="text-white/60" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                     <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">Cloud Storage</div>
                     <div className="text-sm font-black text-white">4.2 GB / 20 GB</div>
                     <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                        <div className="w-[21%] h-full bg-white/40" />
                     </div>
                  </div>
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                     <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">Neural Credits</div>
                     <div className="text-sm font-black text-white">12,450 XP</div>
                     <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                        <div className="w-[60%] h-full bg-white/40" />
                     </div>
                  </div>
               </div>

               <button className="w-full h-12 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.01] transition-all">
                  Manage Subscriptions
               </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center text-white/10 uppercase font-black tracking-widest text-sm italic">
            Module under construction
          </div>
        );
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Preferences Center" 
      maxWidth="920px"
    >
      <div className="flex h-[560px] -mx-6 -my-6 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 bg-black border-r border-white/5 flex flex-col p-4 shrink-0">
          <div className="mb-8 px-2">
             <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">Flippy Prefs</div>
          </div>
          <nav className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-white/5 text-white' 
                    : 'text-white/30 hover:bg-white/[0.02] hover:text-white/60'
                }`}
              >
                <div className={`p-1.5 rounded-lg border transition-colors ${
                  activeCategory === cat.id ? 'border-white/10' : 'border-transparent'
                }`}>
                  {cat.icon}
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest">{cat.id}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto px-4 py-3 border-t border-white/5 flex items-center justify-between">
             <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest italic">v.1.2.4-stable</span>
             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-black p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </Modal>
  );
};

export default SettingsModal;
