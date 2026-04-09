import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIStore } from '../../store/useAIStore';
import TrainingPanel from '../ai/TrainingPanel';
import GenerationPanel from '../ai/GenerationPanel';
import {
  X,
  Cpu,
  Wand2,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface AIStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 30 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.15 } }
};

const AIStudioModal: React.FC<AIStudioModalProps> = ({ isOpen, onClose }) => {
  const { view, setView } = useAIStore();

  const handleBack = () => setView('home');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-[90vw] max-w-[1100px] h-[85vh] max-h-[720px] bg-[#0A0A0A] border border-white/[0.08] rounded-3xl shadow-2xl shadow-purple-900/10 overflow-hidden flex flex-col"
          >
            {/* --- Header --- */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-5 shrink-0 bg-black/40">
              <div className="flex items-center gap-3">
                {view !== 'home' && (
                  <motion.button
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={handleBack}
                    className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"
                  >
                    <ArrowLeft size={16} />
                  </motion.button>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <span className="text-sm font-black text-white tracking-tight">
                    {view === 'home' && 'AI Studio'}
                    {view === 'train' && 'Train Model'}
                    {view === 'generate' && 'Forge Engine'}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-xl text-white/30 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* --- Content --- */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {/* Home: Split Screen */}
                {view === 'home' && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex"
                  >
                    {/* Train Model Card */}
                    <button
                      onClick={() => setView('train')}
                      className="flex-1 flex flex-col items-center justify-center gap-6 border-r border-white/5 hover:bg-white/[0.02] transition-all duration-500 group cursor-pointer p-8"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/10 to-purple-800/10 border border-purple-500/20 flex items-center justify-center group-hover:border-purple-500/50 group-hover:shadow-[0_0_40px_-12px_rgba(147,51,234,0.5)] transition-all duration-500"
                      >
                        <Cpu size={40} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                      </motion.div>
                      <div className="text-center">
                        <h2 className="text-lg font-black text-white tracking-tight">Train Model</h2>
                        <p className="text-xs text-white/30 mt-2 max-w-[240px] leading-relaxed">
                          Upload 6-12 reference images and fine-tune your own AI model using LoRA technology.
                        </p>
                      </div>
                      <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-bold text-purple-300 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all">
                        Start Training →
                      </div>
                    </button>

                    {/* Text to Image Card */}
                    <button
                      onClick={() => setView('generate')}
                      className="flex-1 flex flex-col items-center justify-center gap-6 hover:bg-white/[0.02] transition-all duration-500 group cursor-pointer p-8"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/10 to-cyan-800/10 border border-blue-500/20 flex items-center justify-center group-hover:border-blue-500/50 group-hover:shadow-[0_0_40px_-12px_rgba(59,130,246,0.5)] transition-all duration-500"
                      >
                        <Wand2 size={40} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
                      </motion.div>
                      <div className="text-center">
                        <h2 className="text-lg font-black text-white tracking-tight">Text to Image</h2>
                        <p className="text-xs text-white/30 mt-2 max-w-[240px] leading-relaxed">
                          Generate stunning visuals from text prompts with industry-leading AI models.
                        </p>
                      </div>
                      <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold text-blue-300 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all">
                        Open Forge →
                      </div>
                    </button>
                  </motion.div>
                )}

                {/* Train Panel */}
                {view === 'train' && (
                  <motion.div
                    key="train"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="h-full"
                  >
                    <TrainingPanel />
                  </motion.div>
                )}

                {/* Generate Panel */}
                {view === 'generate' && (
                  <motion.div
                    key="generate"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="h-full"
                  >
                    <GenerationPanel onClose={onClose} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIStudioModal;
