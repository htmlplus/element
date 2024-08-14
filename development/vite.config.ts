import { defineConfig } from 'vite';

import { vite as htmlplus } from '../src/bundlers/index.js';
import { customElement, extract, parse, read, style, validate } from '../src/transformer/index.js';

export default defineConfig({
  server: {
    open: '/development/index.html',
    port: 3500
  },
  resolve: {
    alias: {
      '@htmlplus/element/internal.js': '../src/client/internal/index.js',
      '@htmlplus/element': '../src/client/index.js'
    }
  },
  plugins: [htmlplus(read(), parse(), validate(), extract(), style(), customElement())]
});
