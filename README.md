# 🎨 Flippy Studio

Flippy Studio, oyun geliştiricileri ve UI/UX tasarımcıları için geliştirilmiş, **AI destekli** ve **yüksek performanslı** bir tasarım editörüdür. Modern grafik programlama teknikleriyle inşa edilen bu araç, fikirlerinizi anında dijital varlıklara dönüştürmenize yardımcı olur.

[![Deploy with Vercel](https://vercel.com/button)](https://flippy-studio.vercel.app)

## ✨ Temel Özellikler

- **🤖 AI Asset Generator**: Gemini ve Stable Diffusion entegrasyonu ile metinden profesyonel tasarım varlıkları üretin.
- **📐 Pro-Grade Canvas**: **KonvaJS (GPU Destekli)** ile binlerce objede bile 60fps akıcılık.
- **⚛️ Atomic State Management**: **Zustand** ile her pikselde reaktif ve yüksek performanslı state kontrolü.
- **⚡ Pro-Toolbar**: Radix UI Tooltip'li, Figma estetiğine sahip dinamik araç seti.
- **💎 Premium UI/UX**: Glassmorphism etkileri, modern karanlık tema ve akıcı geçişler.
- **⚙️ Real-time Properties Panel**: Seçili objelerin tüm özelliklerini (Renk, Opacity, Boyut, Rotate) anlık senkronizasyonla düzenleyin.
- **🔗 Engine Bridge**: Unity, Unreal Engine ve Godot projeleriyle gerçek zamanlı senkronizasyon altyapısı.

## 🚀 Teknoloji Yığını

- **Framework**: [React 19](https://react.dev/)
- **Rendering Engine**: [KonvaJS](https://konvajs.org/) (GPU Accelerated Canvas)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (High-performance Atomic State)
- **Vector Logic**: [Paper.js](http://paperjs.org/) (Mathematical Beziers & Paths)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Auth**: [Clerk](https://clerk.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🛠️ Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için:

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/egehandogan/Flippy_Studio.git
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Çevre değişkenlerini (`.env`) ayarlayın:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_key
   VITE_HF_API_KEY=your_hf_key
   ```

4. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

## 🌐 Canlı Önizleme

Projenin en güncel sürümüne şu adresten ulaşabilirsiniz: [https://flippy-studio.vercel.app](https://flippy-studio.vercel.app)

---
Developed with ❤️ by **Antigravity AI (Senior Software Architect Team)**
