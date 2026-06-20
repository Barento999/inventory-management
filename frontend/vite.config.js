import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    compress: true,
  },
  build: {
    // Optimize bundle size (use esbuild which is built-in)
    minify: 'esbuild',
    // Code splitting strategy
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries
          'react-core': ['react', 'react-dom', 'react-router-dom'],
          'form-libs': ['react-hook-form'],
          'ui-libs': ['lucide-react'],
          'charts': ['recharts'],
        },
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 600,
    // CSS splitting
    cssCodeSplit: true,
    // Source maps for production debugging
    sourcemap: false,
  },
  // Optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-hook-form',
      'lucide-react',
      'recharts',
      'axios',
    ],
    exclude: ['dist', 'node_modules'],
  },
});