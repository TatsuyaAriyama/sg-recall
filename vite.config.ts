import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command }) => ({
  // GitHub Pages 用に build 時のみ base を sg-recall に。dev は '/' のまま。
  base: command === 'build' ? '/sg-recall/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    strictPort: false,
  },
}));
