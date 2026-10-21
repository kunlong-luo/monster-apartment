import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Pagevela style: ESM, Vite, React, Tailwind; Phaser owns the frame-by-frame canvas.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  server: { host: '127.0.0.1' },
  // The Phaser scene is lazy-loaded as its own ~1.4 MB chunk; the default 500 kB
  // warning would fire on an intentional split, so raise it above that chunk.
  build: { chunkSizeWarningLimit: 1500 },
});
