import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: './',
  plugins: [react()],
  clearScreen: false,
  server: {
    strictPort: true,
    watch: {
      ignored: ['**/tauri/**'],
    },
  },
  build: {
    outDir: '../.build',
    emptyOutDir: true,
  },
});
