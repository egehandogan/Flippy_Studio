import React, { useState } from 'react';
import { Search, Sparkles, Menu, Bell, Loader2, Send } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import { generateImage } from '../../services/AIService';
import { useSceneStore, type Asset } from '../../store/useSceneStore';

interface TopBarProps {
  onOpenAI?: () => void; 
}

const TopBar: React.FC<TopBarProps> = () => {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const addAsset = useSceneStore((state) => state.addAsset);
  const selectAssets = useSceneStore((state) => state.selectAssets);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const imageUrl = await generateImage(prompt);
      const id = crypto.randomUUID();
      
      const newAsset: Asset = {
        id,
        type: 'image',
        x: 100,
        y: 100,
        width: 512,
        height: 512,
        rotation: 0,
        name: `AI: ${prompt.slice(0, 20)}...`,
        visible: true,
        locked: false,
        parentId: null,
        properties: {
          src: imageUrl,
          opacity: 100,
        }
      };
      
      addAsset(newAsset);
      selectAssets([id]);
      setIsAIModalOpen(false);
      setPrompt('');
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("AI Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
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

        <div className="relative">
          <button 
            onClick={() => setIsAIModalOpen(!isAIModalOpen)}
            className="flex items-center gap-2 px-5 h-10 bg-gradient-to-r from-[#BD00FF] to-[#0094FF] rounded-xl text-[11px] font-bold text-white hover:opacity-90 transition-all shadow-[0_0_20px_-5px_rgba(189,0,255,0.5)] active:scale-95"
          >
            <Sparkles size={14} />
            Make with AI
          </button>

          {isAIModalOpen && (
            <div className="absolute top-full mt-3 right-0 w-80 bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 z-[100]">
              <div className="space-y-1">
                <h4 className="text-[12px] font-bold text-white">Flippy AI Generator</h4>
                <p className="text-[10px] text-white/40">Describe what you want to create...</p>
              </div>
              <div className="relative">
                <textarea 
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] text-white/90 focus:outline-none focus:border-flippy-blue/40 resize-none"
                  placeholder="e.g. A futuristic cyberpunk city concept art..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              <button 
                disabled={isGenerating || !prompt.trim()}
                onClick={handleGenerate}
                className="w-full h-10 bg-flippy-blue disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-flippy-blue/90 transition-all"
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
                {isGenerating ? 'Generating...' : 'Generate Asset'}
              </button>
            </div>
          )}
        </div>

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
  );
};

export default TopBar;
