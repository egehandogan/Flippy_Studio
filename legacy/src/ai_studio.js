/**
 * Flippy Studio — AI Studio Manager
 * High-fidelity 'Make with AI' experience with Training and Forging.
 */

export class AIStudio {
    constructor(sceneGraph, onAssetImport) {
        this.sceneGraph = sceneGraph;
        this.onAssetImport = onAssetImport;
        
        this.modal = document.getElementById('ai-panel-modal');
        this.content = document.getElementById('ai-studio-content');
        this.closeBtn = document.getElementById('ai-modal-close');
        
        this.state = {
            view: 'entry', // 'entry', 'train', 'forge', 'training', 'forging'
            categories: [
                { id: 'cat-1', name: 'UI Elements', models: [] },
                { id: 'cat-2', name: 'Backgrounds', models: [] }
            ],
            activeCategoryId: 'cat-1',
            uploads: [], // { id, file, desc, categoryId }
            trainedModels: [
                { id: 'mj', name: 'Midjourney v6', type: 'system' },
                { id: 'sdxl', name: 'Stable Diffusion XL', type: 'system' },
                { id: 'imgn', name: 'Imagine Engine', type: 'system' }
            ],
            forgeResults: [],
            isTraining: false,
            isForging: false,
            forgeParams: {
                prompt: '',
                negativePrompt: '',
                style: '',
                modelId: 'mj'
            }
        };

        this._bindGlobals();
    }

    open() {
        this.modal.style.display = 'flex';
        this.render();
    }

    close() {
        this.modal.style.display = 'none';
        this.state.view = 'entry';
    }

    _bindGlobals() {
        this.closeBtn.onclick = () => this.close();
        this.modal.onclick = (e) => { if (e.target === this.modal) this.close(); };
    }

    // ── Rendering ─────────────────────────────────────────────────────────

    render() {
        this.content.innerHTML = '';
        
        if (this.state.view === 'entry') {
            this._renderEntry();
        } else if (this.state.view === 'train') {
            this._renderTrain();
        } else if (this.state.view === 'forge') {
            this._renderForge();
        }
    }

    _renderHeader(container, title, onBack) {
        const header = document.createElement('div');
        header.className = 'ai-view-header';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'ai-view-title';
        
        if (onBack) {
            const backBtn = document.createElement('button');
            backBtn.className = 'back-btn';
            backBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>`;
            backBtn.onclick = onBack;
            titleEl.appendChild(backBtn);
        }

        const text = document.createElement('span');
        text.innerHTML = title;
        titleEl.appendChild(text);
        
        header.appendChild(titleEl);
        container.appendChild(header);
        return header;
    }

    _renderEntry() {
        const div = document.createElement('div');
        div.className = 'ai-entry-split';
        div.innerHTML = `
            <div class="ai-choice-card" id="btn-goto-train">
                <div class="ai-choice-title">Train Model</div>
                <div class="ai-choice-desc">Fine-tune AI on your specific art style or character. Upload samples to create a custom engine.</div>
            </div>
            <div class="ai-choice-card" id="btn-goto-forge">
                <div class="ai-choice-title">Text to Image</div>
                <div class="ai-choice-desc">Generate high-fidelity assets using system engines or your own trained models.</div>
            </div>
        `;
        this.content.appendChild(div);

        div.querySelector('#btn-goto-train').onclick = () => { this.state.view = 'train'; this.render(); };
        div.querySelector('#btn-goto-forge').onclick = () => { this.state.view = 'forge'; this.render(); };
    }

    _renderTrain() {
        const layout = document.createElement('div');
        layout.className = 'ai-studio-layout';
        
        // Sidebar
        const sidebar = document.createElement('div');
        sidebar.className = 'ai-sidebar';
        sidebar.innerHTML = `
            <div class="ai-sidebar-header">
                <span class="ai-sidebar-title">Categories</span>
                <button class="icon-btn-sm" id="btn-new-category" title="New Category">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                </button>
            </div>
            <div class="ai-sidebar-content">
                ${this.state.categories.map(c => `
                    <div class="ai-folder-item ${c.id === this.state.activeCategoryId ? 'active' : ''}" data-id="${c.id}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                        <span>${c.name}</span>
                    </div>
                `).join('')}
            </div>
        `;

        // Main
        const activeCat = this.state.categories.find(c => c.id === this.state.activeCategoryId);
        const catUploads = this.state.uploads.filter(u => u.categoryId === this.state.activeCategoryId);
        
        const main = document.createElement('div');
        main.className = 'ai-main-view';
        main.id = 'ai-train-main';
        
        const header = this._renderHeader(main, `Training: <strong>${activeCat.name}</strong>`, () => {
            this.state.view = 'entry';
            this.render();
        });

        const trainBtn = document.createElement('button');
        trainBtn.className = 'ai-btn-primary';
        trainBtn.id = 'btn-start-train';
        trainBtn.textContent = `Train ${activeCat.name}`;
        trainBtn.disabled = catUploads.length < 6;
        header.appendChild(trainBtn);

        const grid = document.createElement('div');
        grid.className = 'ai-upload-grid';
        grid.innerHTML = Array.from({length: 12}).map((_, i) => {
            const upload = catUploads[i];
            return `
            <div class="ai-upload-slot ${upload ? 'has-img' : ''}" data-index="${i}">
                ${upload ? `<img src="${upload.src}" class="ai-slot-img"><div class="ai-slot-desc" contenteditable="true" data-index="${i}">${upload.desc || 'Add description...'}</div>` : '<span>+</span>'}
            </div>
            `;
        }).join('');

        main.appendChild(grid);
        layout.appendChild(sidebar);
        layout.appendChild(main);
        this.content.appendChild(layout);

        // Sidebar Events
        sidebar.querySelectorAll('.ai-folder-item').forEach(item => {
            item.onclick = () => {
                this.state.activeCategoryId = item.dataset.id;
                this.render();
            };
        });
        sidebar.querySelector('#btn-new-category').onclick = () => {
            const name = prompt('Category Name:', 'New Style');
            if (name) {
                const id = 'cat-' + Date.now();
                this.state.categories.push({ id, name, models: [] });
                this.state.activeCategoryId = id;
                this.render();
            }
        };

        // Upload Events
        grid.querySelectorAll('.ai-upload-slot').forEach(slot => {
            if (slot.classList.contains('has-img')) return;
            slot.onclick = () => this._handleUpload(activeCat.id);
        });

        trainBtn.onclick = () => {
            this._renderProgress(main, 'Training Neural Network...', 'ai-training-pulse');
            setTimeout(() => this._completeTraining(activeCat), 4000);
        };
    }

    _renderForge() {
        const layout = document.createElement('div');
        layout.className = 'ai-studio-layout';

        const controls = document.createElement('div');
        controls.className = 'ai-forge-controls';
        controls.innerHTML = `
            <div class="ai-field-group">
                <label class="ai-field-label">Engine Model</label>
                <div style="position:relative;">
                    <select class="ai-select" id="model-select">
                        ${this.state.trainedModels.map(m => `<option value="${m.id}" ${m.id === this.state.forgeParams.modelId ? 'selected' : ''}>${m.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="ai-field-group">
                <label class="ai-field-label">Prompt</label>
                <textarea class="ai-input ai-textarea" id="p-prompt" placeholder="What do you want to see?">${this.state.forgeParams.prompt}</textarea>
            </div>
            <div class="ai-field-group">
                <label class="ai-field-label">Negative Prompt</label>
                <textarea class="ai-input ai-textarea" style="min-height:40px;" id="p-anti" placeholder="Things to avoid...">${this.state.forgeParams.negativePrompt}</textarea>
            </div>
            <div class="ai-field-group">
                <label class="ai-field-label">Style Details</label>
                <input type="text" class="ai-input" id="p-style" placeholder="Cyberpunk, 8k, Unreal Engine 5..." value="${this.state.forgeParams.style}">
            </div>
            <button class="ai-btn-primary" id="btn-start-forge" style="margin-top:20px; width:100%;">Forge Assets</button>
        `;

        const mainArea = document.createElement('div');
        mainArea.className = 'ai-main-view';
        mainArea.id = 'ai-forge-main';
        
        this._renderHeader(mainArea, 'Asset Forge', () => {
            this.state.view = 'entry';
            this.render();
        });

        const gallery = document.createElement('div');
        gallery.className = 'ai-forge-gallery';
        if (this.state.forgeResults.length === 0) {
            gallery.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding-top:140px; color:var(--text-muted);">
                Enter prompts to begin forging images...
            </div>`;
        } else {
            this.state.forgeResults.forEach(res => {
                const card = document.createElement('div');
                card.className = 'ai-result-card';
                card.innerHTML = `
                    <img src="${res.src}">
                    <div class="ai-result-overlay">
                        <button class="ai-overlay-btn btn-import">Import to Canvas</button>
                        <button class="ai-overlay-btn">Export</button>
                        <button class="ai-overlay-btn">Regenerate</button>
                    </div>
                `;
                card.querySelector('.btn-import').onclick = () => this._importResult(res.src);
                gallery.appendChild(card);
            });
        }

        mainArea.appendChild(gallery);
        layout.appendChild(controls);
        layout.appendChild(mainArea);
        this.content.appendChild(layout);

        // Events
        const startBtn = controls.querySelector('#btn-start-forge');
        startBtn.onclick = () => {
            if (!document.getElementById('p-prompt').value) return;
            this.state.forgeParams.prompt = document.getElementById('p-prompt').value;
            this.state.forgeParams.negativePrompt = document.getElementById('p-anti').value;
            this.state.forgeParams.style = document.getElementById('p-style').value;
            this.state.forgeParams.modelId = document.getElementById('model-select').value;
            
            this._renderProgress(mainArea, 'Forging Your Vision...', 'ai-training-pulse');
            setTimeout(() => this._completeForging(), 3000);
        };
    }

    _renderProgress(container, text, animClass) {
        // Clear children except header if exists
        const header = container.querySelector('.ai-view-header');
        container.innerHTML = '';
        if (header) container.appendChild(header);

        const progressDiv = document.createElement('div');
        progressDiv.style.flex = '1';
        progressDiv.style.display = 'flex';
        progressDiv.style.flexDirection = 'column';
        progressDiv.style.alignItems = 'center';
        progressDiv.style.justifyContent = 'center';
        progressDiv.style.background = 'radial-gradient(circle at center, rgba(189, 0, 255, 0.08), transparent)';
        
        progressDiv.innerHTML = `
            <div class="${animClass}"></div>
            <div style="margin-top:40px; font-size:18px; font-weight:700; color:white; font-family:var(--font-brand);">${text}</div>
            <div style="margin-top:10px; color:var(--text-secondary); font-size:12px;" id="ai-log">Initializing kernels...</div>
        `;
        container.appendChild(progressDiv);

        const logs = ['Loading weights...', 'Syncing category patterns...', 'Analyzing descriptions...', 'Optimizing latent space...', 'Reconstructing mesh data...'];
        let li = 0;
        const logEl = progressDiv.querySelector('#ai-log');
        const interval = setInterval(() => {
            if (li < logs.length) logEl.textContent = logs[li++];
            else clearInterval(interval);
        }, 800);
    }

    // ── Business Logic ────────────────────────────────────────────────────

    _handleUpload(categoryId) {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (re) => {
                    this.state.uploads.push({
                        id: 'up-' + Date.now() + Math.random(),
                        src: re.target.result,
                        categoryId,
                        desc: ''
                    });
                    this.render();
                };
                reader.readAsDataURL(file);
            });
        };
        input.click();
    }

    _completeTraining(category) {
        this.state.trainedModels.push({
            id: 'custom-' + category.id,
            name: `${category.name} Engine`,
            type: 'user'
        });
        this.state.view = 'train';
        this.render();
    }

    _completeForging() {
        const results = [
            { id: 'res-1', src: `https://picsum.photos/seed/${Math.random()}/512/512` },
            { id: 'res-2', src: `https://picsum.photos/seed/${Math.random()}/512/512` },
            { id: 'res-3', src: `https://picsum.photos/seed/${Math.random()}/512/512` },
            { id: 'res-4', src: `https://picsum.photos/seed/${Math.random()}/512/512` }
        ];
        this.state.forgeResults = [...results, ...this.state.forgeResults];
        this.state.view = 'forge';
        this.render();
    }

    _importResult(src) {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            this.onAssetImport(img);
            this.close();
        };
    }
}
