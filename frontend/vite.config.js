import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh for better development experience
      fastRefresh: true,
      // Optimize JSX runtime
      jsxRuntime: 'automatic'
    })
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // Enable connection pooling
        agent: false,
        // Timeout settings
        timeout: 30000
      }
    }
  },
  build: {
    // Production optimizations
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2, // Multiple passes for better compression
        unsafe_arrows: true,
        unsafe_methods: true,
        unsafe_proto: true
      },
      mangle: {
        safari10: true,
        properties: {
          regex: /^_/
        }
      },
      format: {
        comments: false
      }
    },
    // Advanced rollup optimizations
    rollupOptions: {
      output: {
        // Aggressive code splitting for better caching
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('axios')) {
              return 'http-vendor';
            }
            // Other large libraries
            if (id.includes('lodash') || id.includes('moment') || id.includes('date-fns')) {
              return 'utils-vendor';
            }
            return 'vendor';
          }
          
          // Component chunks
          if (id.includes('/pages/')) {
            return 'pages';
          }
          if (id.includes('/components/')) {
            return 'components';
          }
          if (id.includes('/context/')) {
            return 'context';
          }
        },
        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '') : 'chunk';
          return `assets/[name]-[hash].js`;
        },
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      // External dependencies (if using CDN)
      external: []
    },
    // Optimize chunk sizes
    chunkSizeWarningLimit: 500,
    // Disable source maps in production for smaller builds
    sourcemap: false,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize assets
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
    // Enable build cache
    emptyOutDir: true
  },
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'axios'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  // Enable esbuild optimizations
  esbuild: {
    target: 'es2020',
    legalComments: 'none',
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
  },
  // CSS optimizations
  css: {
    devSourcemap: false,
    postcss: {
      plugins: [
        // Add autoprefixer and cssnano for production
      ]
    }
  }
})
