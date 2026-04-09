import { defineConfig } from 'vite'

export default defineConfig({
  // Allow importing HTML files in subdirectories
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'login.html',
        launcher: 'launcher.html',
      }
    }
  },
  server: {
    open: '/login.html'
  }
})
