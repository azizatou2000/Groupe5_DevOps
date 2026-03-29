import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },
    host: true, // ICI : Cela force l'écoute sur 0.0.0.0
    strictPort: true,
    port: 5173,
  }
})