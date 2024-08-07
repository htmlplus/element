import { defineConfig } from 'vite';

import { htmlplus } from '../src/bundlers/vite.js';
import { customElement, extract, parse, read, style, validate } from '../src/transformer/index.js';

export default defineConfig({
  server: {
    open: '/development/index.html',
    port: 3500
  },
  resolve: {
    alias: {
      '@htmlplus/element/client': '../src/client/',
      '@htmlplus/element': '../src/client/index.js'
    }
  },
  plugins: [htmlplus(read(), parse(), validate(), extract(), style(), customElement())]
});
