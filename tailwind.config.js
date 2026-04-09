/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'flippy-purple': '#BD00FF',
        'flippy-blue': '#0094FF',
        'flippy-dark': '#0A0A0A',
        'flippy-bg': '#000000',
        'flippy-panel': '#080808',
        'flippy-border': 'rgba(255, 255, 255, 0.08)',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
      }
    },
  },
  plugins: [],
}
