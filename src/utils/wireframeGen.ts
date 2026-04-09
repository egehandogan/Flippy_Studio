import { type Asset } from '../store/useSceneStore';

type GenreGroup = 'combat' | 'strategic' | 'immersive' | 'competitive' | 'abstract';

const GENRE_TO_GROUP: Record<string, GenreGroup> = {
  rpg: 'strategic',
  fps: 'combat',
  tps: 'combat',
  action: 'combat',
  adventure: 'immersive',
  strategy: 'strategic',
  simulation: 'immersive',
  sports: 'competitive',
  racing: 'competitive',
  fighting: 'combat',
  moba: 'strategic',
  horror: 'immersive',
  puzzle: 'abstract',
  platformer: 'abstract',
  stealth: 'immersive',
  survival: 'immersive',
  sandbox: 'immersive',
  roguelike: 'strategic',
};

interface WireframeElement {
  name: string;
  type: 'rect' | 'text' | 'circle';
  x: number;
  y: number;
  w: number;
  h: number;
  props?: Record<string, string | number | boolean | undefined>;
}

export const generateWireframeLayout = (
  genre: string,
  type: string,
  frameId: string,
  w: number,
  h: number
): Partial<Asset>[] => {
  const group = GENRE_TO_GROUP[genre] || 'combat';
  const elements: WireframeElement[] = [];

  const add = (
    name: string, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    assetType: 'rect' | 'text' | 'circle' = 'rect', 
    props: Record<string, string | number | boolean | undefined> = {}
  ) => {
    elements.push({ name, x, y, w: width, h: height, type: assetType, props });
  };

  switch (type) {
    case 'main-menu': {
      add('Background Overlay', 0, 0, w, h, 'rect', { fill: '#FFFFFF05' });
      add('Title', w * 0.1, h * 0.2, w * 0.4, 60, 'text', { text: `${genre.toUpperCase()} UNTITLED`, fontSize: 48, fontWeight: 'bold' });
      const menuX = group === 'combat' ? w * 0.7 : w * 0.1;
      add('Play Button', menuX, h * 0.5, 220, 45, 'rect', { fill: '#FFFFFF10' });
      add('Options Button', menuX, h * 0.58, 220, 45);
      add('Store Button', menuX, h * 0.66, 220, 45);
      add('Quit Button', menuX, h * 0.74, 220, 45);
      break;
    }

    case 'hud': {
      if (group === 'combat') {
        add('Crosshair H', w / 2 - 10, h / 2, 20, 2, 'rect', { fill: '#00FF00' });
        add('Crosshair V', w / 2, h / 2 - 10, 2, 20, 'rect', { fill: '#00FF00' });
        add('Health Bar', 40, h - 80, 250, 25, 'rect', { fill: '#FF444440', stroke: '#FF4444', cornerRadius: 4 });
        add('Shield Bar', 40, h - 50, 200, 10, 'rect', { fill: '#4444FF40', stroke: '#4444FF', cornerRadius: 2 });
        add('Ammo Count', w - 150, h - 100, 100, 60, 'text', { text: '30 / 90', fontSize: 32, textAlign: 'right' });
        add('Weapon Icon', w - 240, h - 90, 80, 40);
      } else if (group === 'strategic') {
        add('Minimap Frame', w - 240, 40, 200, 200, 'rect', { cornerRadius: 10, strokeWidth: 4 });
        for (let i = 0; i < 5; i++) {
          add(`Skill ${i+1}`, w / 2 - 150 + i * 60, h - 70, 50, 50);
        }
        add('Unit Info', 40, h - 180, 300, 140, 'rect', { cornerRadius: 8 });
        add('XP Bar', 0, h - 5, w, 5, 'rect', { fill: '#FFD700' });
      } else if (group === 'competitive') {
        add('Scoreboard', w / 2 - 150, 20, 300, 50, 'rect', { cornerRadius: 25 });
        add('Team A Logo', w / 2 - 130, 25, 40, 40, 'circle');
        add('Team B Logo', w / 2 + 90, 25, 40, 40, 'circle');
        add('Timer', w / 2 - 30, 30, 60, 30, 'text', { text: '12:45', textAlign: 'center' });
      } else if (group === 'immersive') {
        add('Vignette', 0, 0, w, h, 'rect', { fill: '#00000040' });
        add('Context Info', w / 2 - 100, h - 150, 200, 40, 'text', { text: '[E] OPEN DOOR', textAlign: 'center' });
      }
      break;
    }

    case 'inventory': {
      add('Blur BG', 0, 0, w, h, 'rect', { fill: '#00000080' });
      add('Window', 100, 100, w - 200, h - 200, 'rect', { cornerRadius: 20 });
      add('Tab Weapon', 100, 100, 150, 50);
      add('Tab Gear', 250, 100, 150, 50);
      const gridW = (w - 300) / 6;
      for (let i = 0; i < 24; i++) {
        const row = Math.floor(i / 6);
        const col = i % 6;
        add(`Item ${i}`, 150 + col * gridW, 180 + row * gridW, gridW - 10, gridW - 10);
      }
      add('Details Sidebar', w - 400, 180, 250, h - 350);
      break;
    }

    case 'character': {
      add('Char Preview Area', 100, 100, w * 0.4, h - 200, 'rect', { cornerRadius: 20 });
      const statsX = w * 0.6;
      add('Stats Title', statsX, 100, 300, 40, 'text', { text: 'ATTRIBUTES', fontSize: 24 });
      for (let i = 0; i < 6; i++) {
        add(`Stat Bar ${i}`, statsX, 160 + i * 50, 300, 15);
        add(`Stat Label ${i}`, statsX, 150 + i * 50, 100, 20, 'text', { text: `Attribute ${i+1}`, fontSize: 10 });
      }
      break;
    }

    case 'quest': {
      add('Quest Panel', w * 0.5 - 200, 100, 400, h - 200, 'rect', { cornerRadius: 10 });
      add('Scroll Area', w * 0.5 - 180, 180, 360, h - 400);
      add('Description', w * 0.5 - 170, 200, 340, 100, 'text', { text: 'Travel to the forbidden forest and find the lost artifact of Elders.', fontSize: 14 });
      add('Accept Button', w * 0.5 - 100, h - 180, 200, 45, 'rect', { fill: '#00FF0020' });
      break;
    }

    case 'map': {
      add('Map Base', 50, 50, w - 100, h - 100, 'rect', { fill: '#1A1A1A', cornerRadius: 20 });
      add('Player Marker', w/2, h/2, 20, 20, 'circle', { fill: '#FFFFFF' });
      for (let i = 0; i < 8; i++) {
        add(`POI ${i}`, Math.random() * (w - 200) + 100, Math.random() * (h - 200) + 100, 10, 10, 'rect', { fill: '#FFD700' });
      }
      break;
    }

    case 'settings': {
      add('Title', 100, 60, 400, 40, 'text', { text: 'SYSTEM SETTINGS', fontSize: 32 });
      add('Back Button', 60, 60, 40, 40, 'circle');
      for (let i = 0; i < 5; i++) {
        add(`Slider ${i}`, 200, 150 + i * 80, 500, 8);
        add(`Label ${i}`, 200, 130 + i * 80, 200, 20, 'text', { text: `Setting Name ${i+1}` });
      }
      break;
    }

    case 'action-bar': {
      const barW = Math.min(800, w * 0.8);
      const slotSize = barW / 12;
      add('Bar BG', w/2 - barW/2, h - slotSize - 20, barW, slotSize, 'rect', { cornerRadius: 8 });
      for (let i = 0; i < 10; i++) {
        add(`Slot ${i+1}`, w/2 - barW/2 + 10 + i * slotSize, h - slotSize - 10, slotSize - 10, slotSize - 10);
      }
      break;
    }

    case 'chat': {
      add('Chat Panel', 20, h - 350, 350, 300, 'rect', { fill: '#00000040', cornerRadius: 4 });
      add('Input Bar', 25, h - 85, 340, 30, 'rect', { fill: '#FFFFFF10' });
      add('System Msg', 30, h - 120, 300, 20, 'text', { text: 'System: Welcome to the server!', fontSize: 10, fill: '#FFD700' });
      break;
    }

    case 'store': {
      add('Balances', w - 200, 40, 150, 40, 'rect', { cornerRadius: 20 });
      add('Currency Icon', w - 190, 50, 20, 20, 'circle', { fill: '#FFD700' });
      add('Grid', 100, 120, w - 200, h - 250);
      for (let i = 0; i < 8; i++) {
        const col = i % 4;
        const row = Math.floor(i / 4);
        add(`Store Item ${i}`, 120 + col * (w-240)/4, 140 + row * 220, (w-240)/4 - 20, 200);
      }
      break;
    }

    case 'crafting': {
      add('Recipes List', 100, 100, 300, h - 200);
      add('Workspace Area', 450, 100, w - 550, h - 200, 'rect', { cornerRadius: 40 });
      add('Result Slot', w - 300, h / 2 - 50, 100, 100, 'rect', { strokeWidth: 4 });
      add('Craft Button', w - 300, h / 2 + 80, 100, 40);
      break;
    }

    case 'loading': {
      add('Splash Art', 0, 0, w, h, 'rect', { fill: '#050505' });
      add('Progress Bar BG', w * 0.1, h - 100, w * 0.8, 4, 'rect', { fill: '#FFFFFF20' });
      add('Progress Bar Value', w * 0.1, h - 100, w * 0.3, 4, 'rect', { fill: '#FFFFFF' });
      add('Hint Text', w * 0.1, h - 80, w * 0.8, 30, 'text', { text: 'Hint: Do not stand in the fire!', textAlign: 'center', fontSize: 12 });
      break;
    }

    case 'game-over': {
      add('Overlay', 0, 0, w, h, 'rect', { fill: '#FF000015' });
      add('Title', w / 2 - 200, h * 0.3, 400, 80, 'text', { text: 'DEFEAT', fontSize: 72, textAlign: 'center', fill: '#FF4444' });
      add('Restart btn', w / 2 - 100, h * 0.6, 200, 50);
      add('Main menu btn', w / 2 - 100, h * 0.68, 200, 50);
      break;
    }

    case 'lobby': {
      add('Lobby Frame', 50, 50, w - 100, h - 100, 'rect');
      for (let i = 0; i < 4; i++) {
        add(`Player Slot ${i+1}`, 100, 120 + i * 80, w - 500, 60);
      }
      add('Ready Button', w - 350, h - 150, 250, 60, 'rect', { fill: '#00FF0040' });
      break;
    }

    case 'social': {
      add('Drawer', w - 350, 0, 350, h, 'rect', { fill: '#111111' });
      add('Search', w - 330, 20, 310, 40);
      for (let i = 0; i < 10; i++) {
        add(`Frend ${i+1}`, w - 330, 80 + i * 60, 310, 50);
        add(`Status ${i+1}`, w - 60, 95 + i * 60, 10, 10, 'circle', { fill: '#00FF00' });
      }
      break;
    }

    case 'cinematic': {
        add('Top Letterbox', 0, 0, w, 100, 'rect', { fill: '#000000' });
        add('Bottom Letterbox', 0, h - 120, w, 120, 'rect', { fill: '#000000' });
        add('Subtitle', w * 0.2, h - 80, w * 0.6, 60, 'text', { text: 'No one suspected that the ancient gates would open again...', textAlign: 'center', fontStyle: 'italic', fontSize: 18 });
        break;
    }

    default:
      add('Placeholder', w / 2 - 100, h / 2 - 20, 200, 40, 'text', { text: type.toUpperCase() });
  }

  return elements.map((el) => ({
    id: crypto.randomUUID(),
    type: el.type,
    x: el.x,
    y: el.y,
    width: el.w,
    height: el.h,
    rotation: 0,
    name: el.name,
    visible: true,
    locked: false,
    parentId: frameId,
    properties: {
      fill: el.type === 'text' ? undefined : '#FFFFFF10',
      stroke: '#FFFFFF20',
      strokeWidth: 1,
      cornerRadius: 4,
      ...el.props,
    },
  })) as Asset[];
};
