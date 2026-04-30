// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          vendor: ['html2canvas'] // ajuste conforme suas libs
        }
      }
    }
  }
})