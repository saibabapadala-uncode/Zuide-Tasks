import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts'
          if (id.includes('framer-motion')) return 'vendor-motion'
          if (id.includes('react-hook-form') || id.includes('react-dropzone')) return 'vendor-forms'
          if (id.includes('@ionic/') || id.includes('ionicons')) return 'vendor-ionic'
          if (id.includes('react-dom') || id.includes('react-router') || (id.includes('node_modules/react/') && !id.includes('@ionic'))) return 'vendor-react'
        },
      },
    },
  },
})
