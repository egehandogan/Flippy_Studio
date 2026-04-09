import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIStore } from '../../store/useAIStore';
import { useSceneStore, type Asset } from '../../store/useSceneStore';
import { useEditorStore } from '../../store/useEditorStore';
import { generateImageFromHF } from '../../services/HFService';
import {
  Sparkles,
  ChevronDown,
  Wand2,
  Download,
  Import,
  RefreshCw,
  Loader2,
  Brain,
} from 'lucide-react';

const PRESET_MODELS = [
  { id: 'stable-diffusion', name: 'Stable Diffusion XL' },
  { id: 'midjourney', name: 'OpenJourney v4' },
  { id: 'imagine', name: 'RealVis XL' },
  { id: 'playground', name: 'Playground v2.5' },
];

const GenerationPanel: React.FC = () => {
  const {
    selectedModel,
    prompt,
    negativePrompt,
    styleDetails,
    isGenerating,
    generatedImages,
    folders,
    setSelectedModel,
    setPrompt,
    setNegativePrompt,
    setStyleDetails,
    setIsGenerating,
    addGeneratedImage,
  } = useAIStore();

  const addAsset = useSceneStore((s) => s.addAsset);
  const selectAssets = useSceneStore((s) => s.selectAssets);

  const trainedModels = folders.filter((f) => f.images.filter((img) => img.url).length >= 6);

  const handleForge = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const fullPrompt = styleDetails.trim() ? `${prompt}, ${styleDetails}` : prompt;
      const url = await generateImageFromHF(fullPrompt, negativePrompt, selectedModel);
      addGeneratedImage({
        id: crypto.randomUUID(),
        url,
        prompt: fullPrompt,
        model: selectedModel,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImportToCanvas = (imgUrl: string, imgPrompt: string) => {
    const id = crypto.randomUUID();
    // Place at viewport center so it's always visible
    const { zoom, panning } = useEditorStore.getState();
    const cx = (window.innerWidth / 2 - panning.x) / zoom - 256;
    const cy = (window.innerHeight / 2 - panning.y) / zoom - 256;
    const asset: Asset = {
      id,
      type: 'image',
      x: cx,
      y: cy,
      width: 512,
      height: 512,
      rotation: 0,
      name: `AI: ${imgPrompt.slice(0, 20)}`,
      visible: true,
      locked: false,
      parentId: null,
      properties: { src: imgUrl, opacity: 100 },
    };
    addAsset(asset);
    selectAssets([id]);
  };

  const handleExport = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `flippy-ai-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="flex h-full">
      {/* Left: Controls */}
      <div className="w-80 border-r border-white/5 flex flex-col bg-black/20">
        <div className="p-4 border-b border-white/5 space-y-4">
          {/* Model Selector */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Model</label>
            <div className="relative">
              <Brain size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full appearance-none bg-[#111] border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-xs font-semibold text-white outline-none focus:border-purple-500/40 transition-all cursor-pointer [&_option]:bg-[#111] [&_option]:text-white [&_optgroup]:bg-[#111] [&_optgroup]:text-white/50"
              >
                <optgroup label="AI Models">
                  {PRESET_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </optgroup>
                {trainedModels.length > 0 && (
                  <optgroup label="Your Models">
                    {trainedModels.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
            </div>
          </div>

          {/* Prompt */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to create..."
              rows={4}
              className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-white/80 placeholder:text-white/15 outline-none focus:border-blue-500/30 resize-none transition-all"
            />
          </div>

          {/* Negative Prompt */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Negative Prompt</label>
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="What to avoid..."
              rows={2}
              className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-white/80 placeholder:text-white/15 outline-none focus:border-red-500/20 resize-none transition-all"
            />
          </div>

          {/* Style Details */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Style Details</label>
            <textarea
              value={styleDetails}
              onChange={(e) => setStyleDetails(e.target.value)}
              placeholder="e.g. cinematic lighting, 8k, hyper-realistic..."
              rows={2}
              className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-white/80 placeholder:text-white/15 outline-none focus:border-yellow-500/20 resize-none transition-all"
            />
          </div>
        </div>

        {/* Forge Button */}
        <div className="p-4">
          <button
            disabled={!prompt.trim() || isGenerating}
            onClick={handleForge}
            className={`w-full h-14 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 relative overflow-hidden ${
              isGenerating
                ? 'bg-white/5 text-white/40 cursor-wait'
                : prompt.trim()
                ? 'bg-gradient-to-r from-[#BD00FF] to-[#0094FF] text-white shadow-[0_0_40px_-8px_rgba(189,0,255,0.6)] hover:shadow-[0_0_60px_-8px_rgba(189,0,255,0.8)] active:scale-[0.98]'
                : 'bg-white/5 text-white/15 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Forging...
              </>
            ) : (
              <>
                <Wand2 size={18} />
                Forge Image
              </>
            )}

            {/* Forge liquid animation */}
            {isGenerating && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Right: Gallery */}
      <div className="flex-1 flex flex-col bg-black/10">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles size={14} className="text-purple-400" />
            Generated Gallery
          </h3>
          <span className="text-[10px] text-white/20 font-mono">{generatedImages.length} images</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {generatedImages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
                <Wand2 size={32} className="text-white/10" />
              </div>
              <div>
                <p className="text-xs font-bold text-white/20">No images yet</p>
                <p className="text-[10px] text-white/10 mt-1">Write a prompt and press Forge</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence>
                {generatedImages.map((img) => (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-white/5"
                  >
                    <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3">
                      <p className="text-[9px] text-white/50 px-4 text-center line-clamp-2">{img.prompt}</p>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleImportToCanvas(img.url, img.prompt)}
                          className="px-3 py-2 bg-blue-500 hover:bg-blue-400 rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5 transition-colors"
                        >
                          <Import size={12} />
                          Import
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleExport(img.url)}
                          className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5 transition-colors"
                        >
                          <Download size={12} />
                          Export
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setPrompt(img.prompt);
                            handleForge();
                          }}
                          className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5 transition-colors"
                        >
                          <RefreshCw size={12} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerationPanel;
