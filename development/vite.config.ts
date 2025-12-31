import { defineConfig } from 'vite';

import { vite as htmlplus } from '../dist/bundlers';
import { customElement, extract, parse, read, style, validate } from '../dist/transformer';
import path from 'path';

export default defineConfig({
  server: {
    open: '/development/index.html',
    port: 3500
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, '../src'),
      '@htmlplus/element': path.resolve(__dirname, '../src/client'),
    }
  },
  plugins: [htmlplus(read(), parse(), validate(), extract(), style(), customElement())]
});
