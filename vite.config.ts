import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Dev-server proxy: routes cloud LLM API calls through the local dev server
  // to avoid CORS restrictions (these APIs are designed for server-to-server use).
  // In production you would need a real backend proxy.
  server: {
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
      },
      '/api/openai': {
        target: 'https://api.openai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openai/, ''),
      },
      '/api/gemini': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gemini/, ''),
      },
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (
            id.includes('node_modules/@mui/material') ||
            id.includes('node_modules/@emotion/react') ||
            id.includes('node_modules/@emotion/styled')
          ) {
            return 'vendor-mui';
          }
          if (id.includes('node_modules/zustand') || id.includes('node_modules/zod')) {
            return 'vendor-utils';
          }
          return undefined;
        },
      },
    },
  },
})
