# 🎨 Flippy Studio

Flippy Studio, oyun geliştiricileri ve UI/UX tasarımcıları için geliştirilmiş, **AI destekli** ve **premium** bir tasarım editörüdür. Modern web teknolojileriyle inşa edilen bu araç, fikirlerinizi anında dijital varlıklara dönüştürmenize yardımcı olur.

[![Deploy with Vercel](https://vercel.com/button)](https://flippy-studio.vercel.app)

## ✨ Temel Özellikler

- **🤖 AI Asset Generator**: Hugging Face (Stable Diffusion) entegrasyonu ile metinden tasarım varlıkları üretin.
- **📐 Gelişmiş Vektör Editörü**: Kare, daire, dikdörtgen ve serbest çizim (Pen Tool) araçları.
- **🏗️ 3D Guide System**: Küp ve Küre projeksiyon rehberleri ile tasarımınıza derinlik katın.
- **⚡ Pro-Toolbar**: Serbestçe sürüklenebilir, genişletilebilir ve tüm tasarım araçlarını barındıran akıllı araç çubuğu.
- **💎 Premium UI/UX**: Glassmorphism etkileri, modern karanlık tema ve akıcı geçişler.
- **⚙️ Real-time Properties**: Figma benzeri sağ panel ile objelerin özelliklerini anlık olarak düzenleyin.
- **🔗 Engine Bridge**: Unity, Unreal Engine ve Godot projeleriyle senkronizasyon altyapısı.

## 🚀 Teknoloji Yığını

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **TypeScript**: Tam tip güvenliği ve sağlam mimari.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Auth**: [Clerk](https://clerk.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Canvas Engine**: Özel yapım Singleton & Observable bazlı sahne yönetim sistemi.

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

Projeye şu adresten ulaşabilirsiniz: [https://flippy-studio.vercel.app](https://flippy-studio.vercel.app)

---
Developed with ❤️ by **Antigravity AI**
