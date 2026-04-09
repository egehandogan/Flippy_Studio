import React, { useState } from 'react';
import Modal from '../shared/Modal';
import { Sparkles, Wand2, Check } from 'lucide-react';

const AIStudioModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulation
    setTimeout(() => {
      setIsGenerating(false);
      setResult('https://api.dicebear.com/7.x/identicon/svg?seed=' + encodeURIComponent(prompt));
    }, 2000);
  };

  const handleImport = () => {
    // Logic to add to scene graph
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✦ Flippy AI Studio" maxWidth="600px">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest pl-1">What are we building?</label>
          <div className="relative group">
            <Wand2 size={16} className="absolute left-4 top-4 text-flippy-purple/40 group-focus-within:text-flippy-purple transition-colors" />
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A futuristic cyberpunk inventory screen with neon accents..."
              className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 pt-4 text-sm text-white focus:outline-none focus:border-flippy-purple/40 transition-all resize-none"
            />
          </div>
        </div>

        {!result ? (
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full h-12 bg-gradient-to-r from-flippy-purple to-flippy-blue text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(189,0,255,0.3)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {isGenerating ? 'Generating UI...' : 'Generate Design'}
          </button>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
             <div className="aspect-video bg-black/40 border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center relative group">
                <img src={result} alt="Generated UI" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <button 
                    onClick={() => setResult(null)}
                    className="px-4 h-9 bg-white/10 border border-white/20 rounded-full text-xs hover:bg-white/20 transition-all"
                   >
                     Regenerate
                   </button>
                </div>
             </div>
             
             <button
                onClick={handleImport}
                className="w-full h-12 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-all"
             >
                <Check size={18} />
                Import to Canvas
             </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

const Loader2: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export default AIStudioModal;
