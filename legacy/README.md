# Flippy Studio: Design-to-Engine Workspace

Flippy Studio is a highly interactive, "Design-to-Engine" workspace built specifically to bridge the gap between UI/UX design and game engines (Unity, Unreal, Godot). With a premium dark aesthetic and dynamic canvas engine, it seeks to deliver a zero-friction translation from visual logic to code implementations.

## 🚀 Core Features (V1 Beta)

### 🎨 Rendering & Environment
- **Infinite Dot Canvas**: High-performance HTML5 Canvas rendering loop with dynamic grid scaling, zooming, and panning logic.
- **Glassmorphism UI**: High aesthetic standard using deep blurs, tailored translucent blacks, and modern typography (`Inter`, `Outfit`).
- **Premium Editor Layout**: A fully structured workspace featuring Left Sidebars (Game Engine Integrations, Layers) and a Right Sidebar (Properties Inspector).

### 🛠️ Advanced Tooling & Interaction
- **Porta-Toolbar**: A fully draggable, perfectly stable floating glassmorphism toolbar holding all primary tools.
- **Scene Graph System**: Robust tracking of all design assets (`FlippyAsset`).
- **Transformation Engine**:
   - Single-select and Multi-select (via `Shift` or Marquee dragging).
   - Moving, proportional Scaling, and smooth corner-pivot Rotation.
   - Rotation handles feature "Magnetic Hit-Testing", working precisely in the 5px-40px zone *outside* an object's boundary.
- **History Management (`Ctrl+Z`)**: 50-step state-snapshot system preventing data loss.
- **Clipboard Management (`Ctrl+C` / `Ctrl+V`)**: Deep serialization allowing copying and pasting. Pasted assets use iterative positioning offsets mimicking professional standards.

### 🎮 Live Engine Sync (Upcoming)
The interface is pre-configured with a "Game Engine Editor" panel to stream logic, coordinates, and assets live to Unity, Unreal, and Godot using WebSockets.

---

## 🛠️ Stack & Technologies
- **Environment**: Vite + Vanilla JavaScript / CSS. No heavy frontend frameworks, relying purely on HTML5 capabilities for extreme speed.
- **Hosting**: Connected to GitHub, auto-deployed via Vercel.

## 📦 Running Locally
1. Clone the repository.
   ```bash
   git clone git@github.com:egehandogan/Flippy_Studio.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

*Document architecture automatically generated and maintained by the Flippy AI Copilot system.*
