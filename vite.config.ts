import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Set by the tauri cli when it runs the before{Dev,Build}Command
const isTauri = !!process.env.TAURI_ENV_PLATFORM;

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
    outDir: isTauri ? '../.build' : '../docs',
    emptyOutDir: true,
  },
});
