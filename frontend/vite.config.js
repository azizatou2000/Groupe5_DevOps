import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api/users': 'http://localhost:8001',
      '/api/token': 'http://localhost:8001',
      '/api/books': 'http://localhost:8002',
      '/api/borrowings': 'http://localhost:8003',
    }
  }
})
