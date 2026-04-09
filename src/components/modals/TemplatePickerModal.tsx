import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import { useBridge } from '../../hooks/useBridge';
import { sceneGraph, FlippyAsset } from '../../core/SceneGraph';
import { Check, Import } from 'lucide-react';

const TemplatePickerModal: React.FC = () => {
  const { connectedEngine, templates, projectName } = useBridge();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Show if connected but not yet imported (simplified logic for demo)
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownOnce, setHasShownOnce] = useState(false);

  // Sync state with bridgeService connectivity (manual trigger for demo)
  useEffect(() => {
    if (connectedEngine && !hasShownOnce) {
       setIsOpen(true);
       setHasShownOnce(true);
    }
  }, [connectedEngine, hasShownOnce]);

  const toggleTemplate = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleImport = () => {
    if (selectedIds.size === 0) return;

    const startX = 100;
    const spacing = 840;

    Array.from(selectedIds).forEach((tid, i) => {
      // Logic from legacy/src/bridge_manager.js (simplified here)
      const asset = new FlippyAsset('frame', startX + (i * spacing), 100, {
        name: `${tid.replace('t-', '').toUpperCase()} SCREEN`,
        width: 1920 / 2.5,
        height: 1080 / 2.5,
      });
      sceneGraph.addAsset(asset);
    });

    setIsOpen(false);
    sceneGraph.notify();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => setIsOpen(false)} 
      title={`Project: ${projectName}`}
      maxWidth="720px"
    >
      <div className="space-y-6">
        <div className="text-xs text-white/40">Select UI screens to import as editable wireframes (CoD Style):</div>
        
        <div className="grid grid-cols-4 gap-3">
          {templates.map((t) => (
            <div 
              key={t.id}
              onClick={() => toggleTemplate(t.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-3 relative overflow-hidden group ${
                selectedIds.has(t.id) 
                  ? 'bg-flippy-blue/20 border-flippy-blue/50 text-white' 
                  : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10'
              }`}
            >
              {selectedIds.has(t.id) && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-flippy-blue rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                  <Check size={12} className="text-white" />
                </div>
              )}
              <div className="text-3xl group-hover:scale-110 transition-transform">{t.icon}</div>
              <div className="text-[10px] font-bold uppercase tracking-tight text-center leading-tight">{t.name}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-white/5">
          <button
            onClick={handleImport}
            disabled={selectedIds.size === 0}
            className="px-6 h-12 bg-flippy-blue hover:bg-flippy-blue/90 disabled:opacity-50 text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(0,148,255,0.3)] transition-all flex items-center gap-2"
          >
            <Import size={18} />
            Import {selectedIds.size > 0 ? `(${selectedIds.size})` : ''} to Canvas
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TemplatePickerModal;
