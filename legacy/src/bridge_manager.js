/**
 * Flippy Studio — Game Engine Bridge Manager
 * Handles GitHub connectivity simulation and template generation.
 */

export class BridgeManager {
    constructor(sceneGraph, onScreensImported) {
        this.sceneGraph = sceneGraph;
        this.onScreensImported = onScreensImported;
        
        this.state = {
            connectedEngine: null, // 'unity', 'unreal', 'godot'
            githubLink: '',
            projectName: '',
            isConnecting: false,
            isPushing: false,
            liveSync: false
        };

        this.templates = this._initTemplates();
    }

    // ── Template Library (CoD Inspired) ───────────────────────────────────

    _initTemplates() {
        return [
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
    }

    _getLocalizedText(engine, key) {
        const langMap = {
            'unreal': { prefix: '[C++]', suffix: '-> UProperty()' },
            'godot': { prefix: '[GD]', suffix: ':= load()' },
            'unity': { prefix: '[C#]', suffix: '[SerializeField]' }
        };
        const lang = langMap[engine] || { prefix: '', suffix: '' };
        return `${lang.prefix} ${key} ${lang.suffix}`;
    }

    createAssetsForTemplate(templateId, engine, x, y) {
        const localized = (key) => this._getLocalizedText(engine, key);
        
        // Root Frame
        const frame = {
            id: crypto.randomUUID(),
            type: 'frame',
            x: x,
            y: y,
            width: 1920 / 2.5, // Scale down for canvas
            height: 1080 / 2.5,
            name: `${templateId.replace('t-', '').toUpperCase()} SCREEN`,
            fill: '#0A0A0B',
            stroke: '#222224',
            strokeWidth: 2,
            children: []
        };

        // Common layout logic for demo
        if (templateId === 't-main') {
            frame.children.push(
                { type: 'text', x: 40, y: 40, width: 300, height: 40, text: localized('GAME TITLE'), fontSize: 24, fill: '#fff' },
                { type: 'rect', x: 40, y: 150, width: 200, height: 30, fill: '#1A1A1C', name: 'Campaign' },
                { type: 'rect', x: 40, y: 190, width: 200, height: 30, fill: '#BD00FF', name: 'Multiplayer' }
            );
        } else if (templateId === 't-hud') {
            frame.children.push(
                { type: 'rect', x: 20, y: 20, width: 100, height: 100, fill: '#111', name: 'MiniMap' },
                { type: 'rect', x: 20, y: 350, width: 150, height: 40, fill: '#111', name: 'Health' },
                { type: 'text', x: 600, y: 370, width: 100, height: 20, text: localized('AMMO: 30/90'), fill: '#fff' }
            );
        } else {
            // Generic CoD Wireframe filler for others
            frame.children.push(
                { type: 'text', x: 20, y: 15, width: 200, height: 20, text: localized(templateId.toUpperCase()), fill: '#text-muted' },
                { type: 'rect', x: 20, y: 50, width: 700, height: 300, fill: '#050506', stroke: '#111' },
                { type: 'rect', x: 50, y: 80, width: 120, height: 80, fill: '#1A1A1C', name: 'Placeholder' }
            );
        }

        return frame;
    }

    // ── Logic ─────────────────────────────────────────────────────────────

    async connectBridge(engine, githubLink) {
        this.state.isConnecting = true;
        this.state.connectedEngine = engine;
        this.state.githubLink = githubLink;
        this.state.projectName = githubLink.split('/').pop() || 'Untitled Project';
        
        // 5s Animation Simulation
        await new Promise(r => setTimeout(r, 5000));
        
        this.state.isConnecting = false;
        this.state.liveSync = true;
    }

    async pushToGithub() {
        if (!this.state.connectedEngine) return;
        this.state.isPushing = true;
        
        // 5s Animation Simulation
        await new Promise(r => setTimeout(r, 5000));
        
        this.state.isPushing = false;
    }
}
