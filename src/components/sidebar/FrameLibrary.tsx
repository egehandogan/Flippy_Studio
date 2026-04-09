import React, { useState } from 'react';
import { 
  Smartphone, 
  Monitor, 
  FileText, 
  Presentation, 
  Gamepad2, 
  AppWindow,
  ChevronRight,
  Layout,
  ArrowLeft
} from 'lucide-react';
import { useSceneStore, type Asset } from '../../store/useSceneStore';
import { useEditorStore } from '../../store/useEditorStore';

interface FrameTemplate {
  name: string;
  width: number;
  height: number;
  icon?: React.ReactNode;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  templates?: FrameTemplate[];
  subCategories?: { id: string; name: string }[];
}

const CATEGORIES: Category[] = [
  { 
    id: 'mobile', 
    name: 'Mobile', 
    icon: <Smartphone size={16} />,
    templates: [
      { name: 'iPhone 15 Pro Max', width: 430, height: 932 },
      { name: 'iPhone 15 Pro', width: 393, height: 852 },
      { name: 'iPhone 14 Plus', width: 428, height: 926 },
      { name: 'iPhone 14', width: 390, height: 844 },
      { name: 'iPhone 13 Mini', width: 375, height: 812 },
      { name: 'Samsung Galaxy S23 Ultra', width: 384, height: 854 },
      { name: 'Samsung Galaxy S23', width: 360, height: 800 },
      { name: 'Google Pixel 8 Pro', width: 412, height: 892 },
      { name: 'Google Pixel 8', width: 412, height: 915 },
      { name: 'iPhone SE', width: 320, height: 568 },
    ]
  },
  { 
    id: 'pc', 
    name: 'PC / Desktop', 
    icon: <Monitor size={16} />,
    templates: [
      { name: 'Desktop HD', width: 1280, height: 720 },
      { name: 'Desktop Full HD', width: 1920, height: 1080 },
      { name: 'Desktop 2K', width: 2560, height: 1440 },
      { name: 'Desktop 4K', width: 3840, height: 2160 },
      { name: 'MacBook Air', width: 1280, height: 832 },
      { name: 'MacBook Pro 14"', width: 1512, height: 982 },
      { name: 'MacBook Pro 16"', width: 1728, height: 1117 },
    ]
  },
  { 
    id: 'paper', 
    name: 'Paper', 
    icon: <FileText size={16} />,
    templates: [
      { name: 'A0', width: 3179, height: 4494 },
      { name: 'A1', width: 2245, height: 3179 },
      { name: 'A2', width: 1587, height: 2245 },
      { name: 'A3', width: 1123, height: 1587 },
      { name: 'A4', width: 794, height: 1123 },
      { name: 'A5', width: 559, height: 794 },
      { name: 'B0', width: 3780, height: 5346 },
      { name: 'B1', width: 2673, height: 3780 },
      { name: 'B2', width: 1890, height: 2673 },
      { name: 'Letter', width: 816, height: 1056 },
    ]
  },
  { 
    id: 'presentation', 
    name: 'Presentation', 
    icon: <Presentation size={16} />,
    templates: [
      { name: 'Slide 16:9', width: 1920, height: 1080 },
      { name: 'Slide 4:3', width: 1024, height: 768 },
      { name: 'Slide 16:10', width: 1920, height: 1200 },
    ]
  },
  { 
    id: 'game', 
    name: 'Video Game', 
    icon: <Gamepad2 size={16} />,
    subCategories: [
      { id: 'rpg', name: 'RPG' },
      { id: 'fps', name: 'FPS (First Person Shooter)' },
      { id: 'tps', name: 'TPS (Third Person Shooter)' },
      { id: 'action', name: 'Action' },
      { id: 'adventure', name: 'Adventure' },
      { id: 'strategy', name: 'Strategy / RTS' },
      { id: 'simulation', name: 'Simulation' },
      { id: 'sports', name: 'Sports' },
      { id: 'racing', name: 'Racing' },
      { id: 'fighting', name: 'Fighting' },
      { id: 'moba', name: 'MOBA' },
      { id: 'horror', name: 'Horror' },
      { id: 'puzzle', name: 'Puzzle' },
      { id: 'platformer', name: 'Platformer' },
      { id: 'stealth', name: 'Stealth' },
      { id: 'survival', name: 'Survival' },
      { id: 'sandbox', name: 'Sandbox' },
      { id: 'roguelike', name: 'Roguelike' },
    ]
  },
  { 
    id: 'app', 
    name: 'App', 
    icon: <AppWindow size={16} />,
    templates: [
      { name: 'iOS App Standard', width: 375, height: 667 },
      { name: 'iOS App Large', width: 414, height: 736 },
      { name: 'Android Small', width: 320, height: 533 },
      { name: 'Android Medium', width: 360, height: 640 },
      { name: 'Android Large', width: 411, height: 731 },
      { name: 'Tablet Mini', width: 768, height: 1024 },
      { name: 'Tablet Standard', width: 834, height: 1112 },
      { name: 'Tablet Pro', width: 1024, height: 1366 },
    ]
  },
];

const GAME_WIREFRAMES = [
  { id: 'main-menu', name: 'Main Menu' },
  { id: 'settings', name: 'Settings Hub' },
  { id: 'inventory', name: 'Inventory / Backpack' },
  { id: 'character', name: 'Character / Skills' },
  { id: 'quest', name: 'Quest Journal' },
  { id: 'map', name: 'Large Map' },
  { id: 'hud', name: 'HUD (Battle)' },
  { id: 'action-bar', name: 'Action Bar' },
  { id: 'chat', name: 'Chat / Combat Log' },
  { id: 'store', name: 'Item Store' },
  { id: 'crafting', name: 'Crafting Menu' },
  { id: 'loading', name: 'Loading Screen' },
  { id: 'game-over', name: 'Game Over' },
  { id: 'lobby', name: 'Multiplayer Lobby' },
  { id: 'social', name: 'Friend List' },
  { id: 'cinematic', name: 'Cinematic Overlay' },
];

const FrameLibrary: React.FC = () => {
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [selectedSubCatId, setSelectedSubCatId] = useState<string | null>(null);
  
  const addAsset = useSceneStore(s => s.addAsset);
  const selectAssets = useSceneStore(s => s.selectAssets);
  const { zoom, panning } = useEditorStore();

  const handleAddFrame = (name: string, width: number, height: number, wireframeType?: string) => {
    const frameId = crypto.randomUUID();
    const assets = useSceneStore.getState().assets;
    
    // Calculate smart position to avoid overlap (Grid layout)
    // Find all top-level frames to calculate the next position
    const topLevelFrames = assets.filter(a => a.type === 'frame' && a.parentId === null);
    
    let cx, cy;
    
    if (topLevelFrames.length === 0) {
      // First frame goes to center of viewport
      cx = (window.innerWidth / 2 - panning.x) / zoom - width / 2;
      cy = (window.innerHeight / 2 - panning.y) / zoom - height / 2;
    } else {
      // Find the rightmost frame
      const rightmost = topLevelFrames.reduce((max, f) => {
        const right = f.x + f.width;
        return right > max ? right : max;
      }, -Infinity);
      
      // Place it to the right with a 100px gap
      cx = rightmost + 100;
      // Keep the same Y as the first frame for horizontal alignment
      cy = topLevelFrames[0].y;
    }

    const frame: Asset = {
      id: frameId,
      type: 'frame',
      x: cx,
      y: cy,
      width,
      height,
      rotation: 0,
      name: name.toUpperCase(),
      visible: true,
      locked: false,
      parentId: null,
      properties: {
        fill: '#FFFFFF08',
        stroke: '#FFFFFF20',
        strokeWidth: 1,
        clipContent: true,
        cornerRadius: 4,
      }
    };

    addAsset(frame);

    // If it's a wireframe, add children
    if (wireframeType) {
      addWireframeElements(frameId, wireframeType, width, height);
    }

    selectAssets([frameId]);
  };

  const addWireframeElements = (frameId: string, type: string, w: number, h: number) => {
    const createChild = (name: string, tx: number, ty: number, tw: number, th: number, assetType: 'rect' | 'text' | 'circle' = 'rect', props: Record<string, unknown> = {}) => {
      addAsset({
        id: crypto.randomUUID(),
        type: assetType,
        x: tx,
        y: ty,
        width: tw,
        height: th,
        rotation: 0,
        name,
        visible: true,
        locked: false,
        parentId: frameId,
        properties: {
           fill: '#FFFFFF10',
           stroke: '#FFFFFF20',
           strokeWidth: 1,
           cornerRadius: 2,
           ...props
        }
      });
    };

    // basic common elements
    if (type === 'main-menu') {
       createChild('Title', w * 0.1, h * 0.2, w * 0.4, 60, 'text', { text: 'GAME TITLE', fontSize: 48, fontWeight: 'bold' });
       createChild('Btn Play', w * 0.1, h * 0.5, 200, 40);
       createChild('Btn Options', w * 0.1, h * 0.58, 200, 40);
       createChild('Btn Quit', w * 0.1, h * 0.66, 200, 40);
    } else if (type === 'hud') {
       createChild('Health Bar', 40, h - 80, 250, 20, 'rect', { fill: '#FF000040' });
       createChild('Mana Bar', 40, h - 50, 200, 15, 'rect', { fill: '#0000FF40' });
       createChild('Minimap', w - 240, 40, 200, 200, 'circle');
       createChild('Skill 1', w / 2 - 100, h - 70, 40, 40);
       createChild('Skill 2', w / 2 - 50, h - 70, 40, 40);
       createChild('Skill 3', w / 2, h - 70, 40, 40);
    } else if (type === 'inventory') {
       createChild('Header', 0, 0, w, 60);
       createChild('Grid Container', 40, 100, w - 300, h - 200);
       for (let i = 0; i < 12; i++) {
         const row = Math.floor(i / 4);
         const col = i % 4;
         createChild(`Slot ${i}`, 60 + col * 100, 120 + row * 100, 80, 80);
       }
       createChild('Char Preview', w - 240, 100, 200, h - 200);
    } else {
       // Default placeholder for other wireframes
       createChild(`${type.toUpperCase()} Label`, w/2 - 100, h/2 - 20, 200, 40, 'text', { text: type.replace('-', ' ').toUpperCase(), textAlign: 'center' });
    }
  };

  const selectedCat = CATEGORIES.find(c => c.id === selectedCatId);

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D] border-l border-white/5 animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-white/5 flex flex-col gap-1 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Layout size={14} className="text-flippy-blue" />
          <span className="text-[11px] font-bold text-white uppercase tracking-wider">Frame Library</span>
        </div>
        <p className="text-[9px] text-white/30 font-medium">Select a device or game genre to start your layout</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {!selectedCatId ? (
          <div className="space-y-4">
             {/* Quick Tip */}
             <div className="p-3 rounded-xl bg-flippy-blue/5 border border-flippy-blue/10 flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-flippy-blue/10 flex items-center justify-center shrink-0">
                  <Monitor size={14} className="text-flippy-blue" />
                </div>
                <div className="flex flex-col gap-0.5">
                   <span className="text-[10px] font-bold text-white">Quick Guide</span>
                   <p className="text-[9px] text-white/40 leading-relaxed">Click a category below to pick a size, or <b>Draw Manual</b> directly on canvas.</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCatId(cat.id)}
                    className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={10} className="text-flippy-blue" />
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 text-white/40 group-hover:text-flippy-blue group-hover:bg-flippy-blue/10 transition-all">
                      {cat.icon}
                    </div>
                    <span className="text-[10px] font-bold text-white/60 tracking-tight">{cat.name}</span>
                  </button>
                ))}
             </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button 
              onClick={() => { setSelectedCatId(null); setSelectedSubCatId(null); }}
              className="flex items-center gap-2 text-[10px] font-bold text-white/30 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft size={12} />
              Back to Categories
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-md bg-flippy-blue/10 text-flippy-blue">
                {selectedCat?.icon}
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">{selectedCat?.name}</h3>
            </div>

            {selectedCat?.templates && (
              <div className="grid grid-cols-1 gap-1.5">
                {selectedCat.templates.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => handleAddFrame(t.name, t.width, t.height)}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-flippy-blue hover:text-white group transition-all"
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-[10px] font-bold text-white group-hover:text-white transition-colors">{t.name}</span>
                      <span className="text-[9px] text-white/20 group-hover:text-white/40">{t.width} × {t.height}</span>
                    </div>
                    <ChevronRight size={12} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}

            {selectedCat?.id === 'game' && !selectedSubCatId && (
              <div className="grid grid-cols-2 gap-2">
                 {selectedCat.subCategories?.map(sub => (
                   <button
                     key={sub.id}
                     onClick={() => setSelectedSubCatId(sub.id)}
                     className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-flippy-blue/50 text-[9px] font-bold text-white/60 hover:text-white text-left transition-all"
                   >
                     {sub.name}
                   </button>
                 ))}
              </div>
            )}

            {selectedSubCatId && (
              <div className="space-y-4 animate-in fade-in duration-300">
                 <button 
                    onClick={() => setSelectedSubCatId(null)}
                    className="flex items-center gap-1.5 text-[9px] font-bold text-flippy-blue hover:underline"
                  >
                    <ArrowLeft size={10} />
                    Change Genre
                  </button>
                  <div className="grid grid-cols-1 gap-1.5">
                    {GAME_WIREFRAMES.map((wf, i) => (
                      <button
                        key={i}
                        onClick={() => handleAddFrame(`${selectedSubCatId} - ${wf.name}`, 1920, 1080, wf.id)}
                        className="flex items-center justify-between p-3 rounded-lg bg-[#111] border border-white/5 hover:bg-white/10 group transition-all"
                      >
                         <div className="flex items-center gap-2">
                           <Layout size={12} className="text-white/20 group-hover:text-flippy-blue" />
                           <span className="text-[10px] font-bold text-white/50 group-hover:text-white transition-colors">{wf.name}</span>
                         </div>
                         <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-black/40">
        <p className="text-[9px] text-white/20 leading-relaxed">
          Select a template to instantly add a frame with standard dimensions and optional wireframe layouts.
        </p>
      </div>
    </div>
  );
};

export default FrameLibrary;
