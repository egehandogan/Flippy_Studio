import React, { useState } from 'react';
import Modal from '../shared/Modal';
import { useBridge } from '../../hooks/useBridge';
import FlippyCoreSync from '../animations/FlippyCoreSync';

const GithubIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

const BridgeModal: React.FC = () => {
  const { pendingEngine, isConnecting, connectedEngine, connect, setPendingEngine } = useBridge();
  const [repoUrl, setRepoUrl] = useState('');

  const isOpen = pendingEngine !== null && connectedEngine === null;

  const handleConnect = async () => {
    if (!repoUrl.trim()) return;
    await connect(repoUrl);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => setPendingEngine(null)} 
      title="Bridge Connect"
      maxWidth="480px"
    >
      <div className="space-y-6">
        {isConnecting ? (
          <FlippyCoreSync />
        ) : (
          <>
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-3">
              <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center shrink-0">
                <GithubIcon size={20} className="text-white/60" />
              </div>
              <div>
                <div className="text-xs font-bold text-white/90">Authentication Required</div>
                <div className="text-[11px] text-white/40 mt-0.5">Securely sync your design frames with game engine source files.</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest pl-1">GitHub Repository URL</label>
              <input 
                type="text" 
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-flippy-blue/40"
              />
            </div>

            <button
              onClick={handleConnect}
              disabled={!repoUrl.trim()}
              className="w-full h-12 bg-flippy-blue hover:bg-flippy-blue/90 disabled:opacity-50 text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(0,148,255,0.3)] transition-all active:scale-[0.98]"
            >
              Connect & Authorize
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default BridgeModal;
