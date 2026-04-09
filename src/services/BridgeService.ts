export interface BridgeState {
  connectedEngine: 'unity' | 'unreal' | 'godot' | null;
  githubLink: string;
  projectName: string;
  isConnecting: boolean;
  isPushing: boolean;
  liveSync: boolean;
  pendingEngine: 'unity' | 'unreal' | 'godot' | null;
}

export interface ScreenTemplate {
  id: string;
  name: string;
  icon: string;
}

type Listener = () => void;

export class BridgeService {
  private static instance: BridgeService;
  state: BridgeState = {
    connectedEngine: null,
    githubLink: '',
    projectName: '',
    isConnecting: false,
    isPushing: false,
    liveSync: false,
    pendingEngine: null,
  };

  templates: ScreenTemplate[] = [
    { id: 't-main', name: 'Main Menu', icon: '🏠' },
    { id: 't-lobby', name: 'Multiplayer Lobby', icon: '👥' },
    { id: 't-loadout', name: 'Loadout (Classes)', icon: '🔫' },
    { id: 't-gunsmith', name: 'Gunsmith (Weapon)', icon: '🔧' },
    { id: 't-hud', name: 'Game HUD', icon: '🎮' },
    { id: 't-store', name: 'Store (Bundles)', icon: '🛒' },
    { id: 't-pass', name: 'Battle Pass', icon: '🎖️' },
    { id: 't-scores', name: 'Scoreboard', icon: '📊' },
    { id: 't-streak', name: 'Killstreaks Select', icon: '✈️' },
    { id: 't-ops', name: 'Operator Select', icon: '👤' },
    { id: 't-map', name: 'Map Selection', icon: '🗺️' },
    { id: 't-stats', name: 'Combat Record', icon: '📈' },
    { id: 't-social', name: 'Social / Friends', icon: '💬' },
    { id: 't-settings', name: 'Settings Hub', icon: '⚙️' },
    { id: 't-end', name: 'End Game Screen', icon: '🏁' },
    { id: 't-field', name: 'Field Upgrades', icon: '🔋' }
  ];

  private listeners: Set<Listener> = new Set();

  private constructor() { }

  static getInstance(): BridgeService {
    if (!BridgeService.instance) {
      BridgeService.instance = new BridgeService();
    }
    return BridgeService.instance;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.listeners.forEach(l => l());
  }

  setPendingEngine(engine: 'unity' | 'unreal' | 'godot' | null) {
    this.state.pendingEngine = engine;
    this.notify();
  }

  async connect(githubLink: string) {
    if (!this.state.pendingEngine) return;
    
    this.state.isConnecting = true;
    this.state.githubLink = githubLink;
    this.notify();

    // Simulation
    await new Promise(r => setTimeout(r, 3000));

    this.state.connectedEngine = this.state.pendingEngine;
    this.state.projectName = githubLink.split('/').pop() || 'Untitled Project';
    this.state.isConnecting = false;
    this.state.liveSync = true;
    this.state.pendingEngine = null;
    this.notify();
  }

  async push() {
    if (!this.state.connectedEngine) return;
    this.state.isPushing = true;
    this.notify();

    await new Promise(r => setTimeout(r, 3000));

    this.state.isPushing = false;
    this.notify();
  }

  getLocalizedText(engine: string, key: string) {
    const langMap: Record<string, { prefix: string; suffix: string }> = {
      'unreal': { prefix: '[C++]', suffix: '-> UProperty()' },
      'godot': { prefix: '[GD]', suffix: ':= load()' },
      'unity': { prefix: '[C#]', suffix: '[SerializeField]' }
    };
    const lang = langMap[engine] || { prefix: '', suffix: '' };
    return `${lang.prefix} ${key} ${lang.suffix}`;
  }
}

export const bridgeService = BridgeService.getInstance();
