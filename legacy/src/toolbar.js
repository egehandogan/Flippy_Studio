/**
 */

export class FloatingToolbar {
    constructor(containerId, onToolChange, onAction) {
        this.container = document.getElementById(containerId);
        this.onToolChange = onToolChange;
        this.onAction = onAction;
        this.activeTool = 'cursor';
        this.isDragging = false;
        
        this.render();
        this.panel = document.getElementById('main-toolbar');
        this.bindEvents();
    }

    render() {
        this.container.innerHTML = `
            <div class="toolbar-panel" id="main-toolbar">
                <button class="tool-btn import" data-tool="import" title="Import Asset (+)">
                    <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    <span class="smart-tooltip">Import (I)</span>
                </button>
                
                <div class="tool-divider"></div>
                
                <button class="tool-btn" data-tool="ai" title="Flippy AI Studio">
                    <svg viewBox="0 0 24 24"><path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5zM19 14l1 3.5 3.5 1-3.5 1-1 3.5-1-3.5-3.5-1 3.5-1z" stroke="currentColor" fill="none"/></svg>
                    <span class="smart-tooltip">AI Studio (A)</span>
                </button>
                
                <div class="tool-group">
                    <button class="tool-btn" data-tool="frame" title="Frame (F)">
                        <svg viewBox="0 0 24 24"><path d="M4 8h16M4 16h16M8 4v16M16 4v16" stroke="currentColor" stroke-width="2" fill="none"/></svg>
                        <span class="smart-tooltip">Frame (F)</span>
                    </button>
                    <button class="tool-btn" data-tool="rect" title="Rectangle (R)">
                        <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" fill="none"/></svg>
                        <span class="smart-tooltip">Rectangle (R)</span>
                    </button>
                    <button class="tool-btn" data-tool="circle" title="Circle (O)">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" stroke="currentColor" fill="none"/></svg>
                        <span class="smart-tooltip">Circle (O)</span>
                    </button>
                    <button class="tool-btn" data-tool="text" title="Text (T)">
                        <svg viewBox="0 0 24 24"><path d="M4 7V4h16v3M9 20h6M12 4v16" stroke="currentColor"/></svg>
                        <span class="smart-tooltip">Text (T)</span>
                    </button>
                    <button class="tool-btn" data-tool="pen" title="Pen (P)">
                        <svg viewBox="0 0 24 24"><path d="M6 18L3 21l2-4L14.5 7.5l2 2L6 18zm10-10l1.5-1.5a1.5 1.5 0 00-2-2L14 6l2 2z" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="15.5" cy="8.5" r="1.5" fill="currentColor"/></svg>
                        <span class="smart-tooltip">Pen (P)</span>
                    </button>
                </div>

                <div class="tool-divider"></div>

                <button class="tool-btn active" data-tool="cursor" title="Cursor (V)">
                    <svg viewBox="0 0 24 24"><path d="M3 3l7 14 3-5 5 3-15-12z" stroke="currentColor" fill="none"/></svg>
                    <span class="smart-tooltip">Cursor (V)</span>
                </button>
                
                <button class="tool-btn" data-tool="comment" title="Comment (C)">
                    <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" fill="none"/></svg>
                    <span class="smart-tooltip">Comment (C)</span>
                </button>

                <div class="tool-divider"></div>

                <button class="tool-btn" data-action="center" title="Center View">
                    <svg viewBox="0 0 24 24"><path d="M3 12h18M12 3v18" stroke="currentColor"/><circle cx="12" cy="12" r="3" stroke="currentColor"/></svg>
                    <span class="smart-tooltip">Center (X)</span>
                </button>

                <div class="zoom-btn" data-action="reset-zoom">100%</div>

                <div class="tool-divider"></div>

                <button class="export-btn" id="export-trigger">
                    Export
                    <div class="export-popup" id="export-menu">
                        <div class="export-option-group">
                            <span class="export-label">Scale</span>
                            <div class="export-grid">
                                <div class="export-pill active">x1</div>
                                <div class="export-pill">x2</div>
                                <div class="export-pill">x4</div>
                            </div>
                        </div>
                        <div class="export-option-group">
                            <span class="export-label">Format</span>
                            <div class="export-grid">
                                <div class="export-pill active">PNG</div>
                                <div class="export-pill">JPG</div>
                                <div class="export-pill">SVG</div>
                                <div class="export-pill">PDF</div>
                            </div>
                        </div>
                    </div>
                </button>
            </div>
        `;
    }

    bindEvents() {
        // Tool Selection
        this.panel.addEventListener('click', (e) => {
            const btn = e.target.closest('.tool-btn');
            if (btn && btn.dataset.tool) {
                this.setActiveTool(btn.dataset.tool);
            }
            
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn && actionBtn.dataset.action) {
                this.onAction(actionBtn.dataset.action);
            }

            // Export Popup Toggle
            if (e.target.closest('#export-trigger')) {
                document.getElementById('export-menu').classList.toggle('open');
            }
        });

        // Dragging Logic - Perfect Porta-Toolbar
        this.panel.addEventListener('mousedown', (e) => {
            if (e.target.closest('.tool-btn') || e.target.closest('.export-btn') || e.target.closest('.zoom-btn')) return;
            
            const rect = this.panel.getBoundingClientRect();
            this.isDragging = true;
            this.panel.classList.add('dragging');
            
            // Switch to absolute positioning with no transform
            this.panel.style.transform = 'none';
            this.panel.style.margin = '0';
            this.panel.style.left = `${rect.left}px`;
            this.panel.style.top = `${rect.top}px`;
            this.panel.style.bottom = 'auto'; // Remove bottom constraint

            this.dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const nx = e.clientX - this.dragOffset.x;
                const ny = e.clientY - this.dragOffset.y;
                this.panel.style.left = `${nx}px`;
                this.panel.style.top = `${ny}px`;
            }
        });

        window.addEventListener('mouseup', () => {
            if (this.isDragging) {
              this.isDragging = false;
              this.panel.classList.remove('dragging');
            }
        });
    }

    setActiveTool(tool) {
        this.activeTool = tool;
        this.panel.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool);
        });
        this.onToolChange(tool);
    }
}
