import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },

  build: {
    // Tighter warning threshold forces you to notice large chunks
    chunkSizeWarningLimit: 400,
    minify: 'terser',
    sourcemap: false,

    terserOptions: {
      compress: {
        drop_console:  true,
        drop_debugger: true,
        pure_funcs:    ['console.log', 'console.info', 'console.debug', 'console.warn'],
      },
      mangle:  { safari10: true },
      format:  { comments: false },
    },

    rollupOptions: {
      output: {
        // Fine-grained manual chunks — each loads only when its route is visited
        manualChunks (id) {
          if (!id.includes('node_modules')) return

          // Split large libs into their own cacheable chunks
          if (id.includes('react-dom'))     return 'react-dom'
          if (id.includes('react-router'))  return 'router'
          if (id.includes('react'))         return 'react'
          if (id.includes('lucide-react'))  return 'icons'
          if (id.includes('axios'))         return 'axios'
          if (id.includes('@vercel'))       return 'vercel'

          // Everything else in a single vendor chunk
          return 'vendor'
        },

        // Deterministic file names for long-term CDN caching
        entryFileNames:  'assets/[name]-[hash].js',
        chunkFileNames:  'assets/[name]-[hash].js',
        assetFileNames:  'assets/[name]-[hash][extname]',
      },
    },
  },

  // Pre-bundle critical deps for faster cold dev-server start
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
})
