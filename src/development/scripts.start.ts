import { createServer } from 'vite';

import { htmlplus } from '../bundlers/vite.js';
import plugins from './htmlplus.config.js';

createServer({
  server: {
    open: '/src/development/index.html',
    port: 3500
  },
  resolve: {
    alias: {
      '@htmlplus/element/client': '/src/client/',
      '@htmlplus/element': '/src/client/index.js'
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: ''
      }
    }
  },
  esbuild: {
    target: 'ES2016'
  },
  plugins: [htmlplus(...plugins)]
})
  .then((server) => server.listen())
  .catch((error) => console.log(error));
