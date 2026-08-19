import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import printerPlugin from './vite-print-plugin.js';

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // vite-print-plugin is ONLY loaded during local dev (npm run dev)
    // In production, the standalone print-server/server.js handles printing
    command === 'serve' ? printerPlugin() : null,
  ].filter(Boolean),

  server: {
    port: 3000,
    host: true,
    proxy: {
      // In dev, vite-print-plugin intercepts /api/print before this proxy runs.
      // This proxy is a safety net in case the plugin is disabled.
      '/api/print': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/print/, '/print'),
      },
    },
  },

  build: {
    // Raise the warning threshold (Firebase is inherently large)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Firebase into separate chunks for better caching
          'firebase-core': ['firebase/app', 'firebase/auth'],
          'firebase-firestore': ['firebase/firestore'],
          'firebase-rtdb': ['firebase/database'],
          // React ecosystem in its own chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
}));
