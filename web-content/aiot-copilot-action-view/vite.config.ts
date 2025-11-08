import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    outDir: resolve(__dirname, '../../media/aiot-copilot-action-view'),
    emptyOutDir: true,
    rollupOptions: { output: { entryFileNames: 'index.js', assetFileNames: 'index.css' } }
  },
})
