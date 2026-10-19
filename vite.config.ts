import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// SINGLE_FILE=1 inlines everything into one index.html for the Cloudflare Worker bundle.
const single = process.env.SINGLE_FILE === '1';

export default defineConfig({
  base: './',
  plugins: [react(), ...(single ? [viteSingleFile()] : [])],
  build: { outDir: single ? 'dist-single' : 'dist', assetsInlineLimit: single ? 100_000_000 : 4096 },
  test: { include: ['src/**/*.test.ts'] },
} as never);
