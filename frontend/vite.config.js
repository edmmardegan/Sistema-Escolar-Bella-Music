// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,          // abre automático
      filename: 'stats.html', // nome do arquivo
      gzipSize: true,
      brotliSize: true
    })
  ],

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom']
        }
      }
    }
  }
})