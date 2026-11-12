import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' — so the static build works from any path (file server, sub-folder, zip).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2500,
  },
  server: { port: 5173 },
});
