import React, { useState } from 'react';
import { Search, Sparkles, Menu, Bell } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import AIStudioModal from '../modals/AIStudioModal';

const TopBar: React.FC = () => {
  const [isAIOpen, setIsAIOpen] = useState(false);

  return (
    <>
      <header className="h-14 border-b border-white/[0.08] bg-black flex items-center justify-between px-4 z-50 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 shadow-xl overflow-hidden">
              <img src="/favicon.svg" alt="Flippy Logo" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-[15px] font-black tracking-tighter text-white">Flippy</span>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-xl text-white/40 transition-all">
            <Menu size={20} />
          </button>
        </div>

        <div className="flex-1 max-w-xl mx-8">
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-flippy-blue transition-all" />
            <input 
              type="text" 
              placeholder="Search in Canvas" 
              className="w-full h-10 bg-white/[0.03] border border-white/[0.05] rounded-full pl-12 pr-4 text-xs font-medium text-white/90 placeholder:text-white/20 focus:outline-none focus:border-flippy-blue/30 focus:bg-white/[0.05] transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Auto Save in 5m</span>
          </div>

          <button 
            onClick={() => setIsAIOpen(true)}
            className="flex items-center gap-2 px-5 h-10 bg-gradient-to-r from-[#BD00FF] to-[#0094FF] rounded-xl text-[11px] font-bold text-white hover:opacity-90 transition-all shadow-[0_0_20px_-5px_rgba(189,0,255,0.5)] active:scale-95"
          >
            <Sparkles size={14} />
            Make with AI
          </button>

          <div className="w-[1px] h-6 bg-white/10 mx-2"></div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 text-white/40 hover:text-white transition-all">
              <Bell size={18} />
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 hover:border-flippy-blue transition-all cursor-pointer">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* AI Studio Modal */}
      <AIStudioModal isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
    </>
  );
};

export default TopBar;
