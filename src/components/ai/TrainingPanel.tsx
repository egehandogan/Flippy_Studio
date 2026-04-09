import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIStore } from '../../store/useAIStore';
import { startTraining } from '../../services/HFService';
import {
  FolderPlus,
  Folder,
  Plus,
  X,
  Cpu,
  Zap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const TrainingPanel: React.FC = () => {
  const {
    folders,
    activeFolderId,
    trainingStatus,
    trainingProgress,
    trainingLogs,
    addFolder,
    setActiveFolder,
    addImageToSlot,
    updateImageDescription,
    removeImage,
    setTrainingStatus,
    setTrainingProgress,
    addTrainingLog,
    resetTraining,
    isReadyToTrain,
  } = useAIStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeSlotRef = useRef<number>(0);

  const activeFolder = folders.find((f) => f.id === activeFolderId);
  const filledCount = activeFolder?.images.filter((img) => img.url).length || 0;

  const handleSlotClick = (slotIndex: number) => {
    activeSlotRef.current = slotIndex;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeFolderId) return;
    const url = URL.createObjectURL(file);
    addImageToSlot(activeFolderId, activeSlotRef.current, file, url);
    e.target.value = '';
  };

  const handleNewFolder = () => {
    const name = prompt('Enter model name:');
    if (name?.trim()) addFolder(name.trim());
  };

  const handleStartTraining = async () => {
    if (!activeFolder || !isReadyToTrain()) return;
    setTrainingStatus('training');
    setTrainingProgress(0);

    const images = activeFolder.images
      .filter((img) => img.url)
      .map((img) => ({ url: img.url, description: img.description }));

    try {
      await startTraining(activeFolder.name, images, (progress, log) => {
        setTrainingProgress(progress);
        addTrainingLog(log);
      });
      setTrainingStatus('success');
    } catch {
      setTrainingStatus('error');
      addTrainingLog('Training failed. Please try again.');
    }
  };

  // ── Training View ──
  if (trainingStatus !== 'idle') {
    return (
      <div className="flex flex-col h-full bg-black/40">
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
              <Cpu size={20} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Training: {activeFolder?.name}</h3>
              <p className="text-[10px] text-white/40">{filledCount} images • LoRA Fine-tuning</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/60">Progress</span>
              <span className="text-xs font-black text-white tabular-nums">{trainingProgress}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${trainingProgress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {trainingStatus === 'training' && (
              <motion.div
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap size={12} className="text-purple-400" />
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Learning in Progress</span>
              </motion.div>
            )}
            {trainingStatus === 'success' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle2 size={12} className="text-green-400" />
                <span className="text-[10px] font-bold text-green-300 uppercase tracking-wider">Model Ready</span>
              </div>
            )}
            {trainingStatus === 'error' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle size={12} className="text-red-400" />
                <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider">Training Failed</span>
              </div>
            )}
          </div>
        </div>

        {/* Logs */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 custom-scrollbar">
          <div className="space-y-1 font-mono">
            <AnimatePresence>
              {trainingLogs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2 py-1"
                >
                  <span className="text-[9px] text-white/20 tabular-nums shrink-0 pt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={`text-[10px] leading-relaxed ${
                    log.includes('✓') || log.includes('complete') ? 'text-green-400' :
                    log.includes('Loss') ? 'text-yellow-300' :
                    log.includes('failed') ? 'text-red-400' :
                    'text-white/50'
                  }`}>
                    {log}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        {(trainingStatus === 'success' || trainingStatus === 'error') && (
          <div className="p-4 border-t border-white/5">
            <button
              onClick={resetTraining}
              className="w-full h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all"
            >
              {trainingStatus === 'success' ? 'Done — Back to Studio' : 'Try Again'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Upload View ──
  return (
    <div className="flex h-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Left: Folders */}
      <div className="w-52 border-r border-white/5 bg-black/20 flex flex-col">
        <div className="p-3 border-b border-white/5">
          <button
            onClick={handleNewFolder}
            className="w-full flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-all text-xs font-bold text-white/60 hover:text-white"
          >
            <FolderPlus size={14} />
            New Model Folder
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setActiveFolder(folder.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all text-left ${
                folder.id === activeFolderId
                  ? 'bg-gradient-to-r from-purple-500/15 to-blue-500/10 border border-purple-500/30 text-white'
                  : 'hover:bg-white/5 text-white/40 hover:text-white/70 border border-transparent'
              }`}
            >
              <Folder size={14} className={folder.id === activeFolderId ? 'text-purple-400' : ''} />
              <span className="text-xs font-semibold truncate">{folder.name}</span>
              <span className="ml-auto text-[9px] font-mono text-white/20">
                {folder.images.filter((i) => i.url).length}/12
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Image Grid */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">{activeFolder?.name || 'Select a Folder'}</h3>
            <p className="text-[10px] text-white/30 mt-0.5">
              Upload at least 6 images to begin training • {filledCount}/12 uploaded
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
            filledCount >= 6 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-white/20 border border-white/5'
          }`}>
            {filledCount >= 6 ? '✓ Ready' : `${6 - filledCount} more needed`}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeFolder && (
            <div className="grid grid-cols-4 gap-3">
              {activeFolder.images.map((img, index) => (
                <motion.div
                  key={img.id}
                  layout
                  className="group relative"
                >
                  {/* Slot */}
                  <div
                    onClick={() => !img.url && handleSlotClick(index)}
                    className={`aspect-square rounded-xl border-2 border-dashed transition-all overflow-hidden cursor-pointer flex items-center justify-center ${
                      img.url
                        ? 'border-transparent'
                        : 'border-white/10 hover:border-purple-500/40 hover:bg-purple-500/5'
                    }`}
                  >
                    {img.url ? (
                      <>
                        <img src={img.url} alt="" className="w-full h-full object-cover rounded-xl" />
                        {/* Remove overlay */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeFolderId) removeImage(activeFolderId, img.id);
                          }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
                        >
                          <X size={12} className="text-white" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-white/20">
                        <Plus size={20} />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Slot {index + 1}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {img.url && (
                    <input
                      type="text"
                      value={img.description}
                      onChange={(e) => {
                        if (activeFolderId) updateImageDescription(activeFolderId, img.id, e.target.value);
                      }}
                      placeholder="Describe..."
                      className="mt-1.5 w-full bg-transparent border border-white/5 focus:border-purple-500/40 rounded-lg px-2 py-1 text-[10px] text-white/60 placeholder:text-white/15 outline-none transition-all"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Train Button */}
        <div className="p-4 border-t border-white/5">
          <button
            disabled={!isReadyToTrain()}
            onClick={handleStartTraining}
            className={`w-full h-12 rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-3 ${
              isReadyToTrain()
                ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-[0_0_30px_-5px_rgba(147,51,234,0.5)] hover:shadow-[0_0_40px_-5px_rgba(147,51,234,0.7)] active:scale-[0.98]'
                : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
            }`}
          >
            <Cpu size={16} />
            {isReadyToTrain() ? 'Start LoRA Training' : `Upload ${Math.max(0, 6 - filledCount)} More Images`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingPanel;
