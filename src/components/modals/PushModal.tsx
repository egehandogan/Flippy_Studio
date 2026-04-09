import React, { useState } from 'react';
import Modal from '../shared/Modal';
import { useBridge } from '../../hooks/useBridge';
import { Send, CheckCircle2 } from 'lucide-react';

const PushModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { isPushing, push, connectedEngine } = useBridge();
  const [commitMessage, setCommitMessage] = useState('feat: update game UI wireframes from Flippy');
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePush = async () => {
    setIsSuccess(false);
    setLogs(['Initializing git push...']);
    setProgress(0);
    
    // Logic from legacy/src/main.js
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + 2;
        if (next === 20) setLogs(l => [...l, '> delta compression...']);
        if (next === 40) setLogs(l => [...l, '> writing objects...']);
        if (next === 70) setLogs(l => [...l, '> remote: processing...']);
        if (next >= 100) clearInterval(interval);
        return next;
      });
    }, 50);

    await push();
    setIsSuccess(true);
    setLogs(l => [...l, '> PUSH SUCCESSFUL']);
    
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sync to Engine Source" maxWidth="440px">
      <div className="space-y-6">
        {!isPushing && !isSuccess ? (
          <>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest pl-1">Commit Message</label>
              <input 
                type="text" 
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-flippy-blue/40"
              />
            </div>
            <button
              onClick={handlePush}
              className="w-full h-12 bg-flippy-purple text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(189,0,255,0.3)] transition-all flex items-center justify-center gap-2"
            >
              <Send size={18} />
              Push Changes to GitHub
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
               <div className={`h-full bg-flippy-purple transition-all duration-100 ${isSuccess ? 'bg-green-500' : ''}`} style={{ width: `${progress}%` }}></div>
            </div>
            
            <div className="bg-black/40 border border-white/5 rounded-xl p-4 h-32 font-mono text-[10px] text-white/60 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className={log.includes('SUCCESSFUL') ? 'text-green-500 font-bold' : ''}>{log}</div>
              ))}
            </div>

            {isSuccess && (
              <div className="flex items-center justify-center gap-2 text-green-500 font-bold animate-in fade-in slide-in-from-bottom-2">
                <CheckCircle2 size={16} />
                Successfully pushed to {connectedEngine}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PushModal;
