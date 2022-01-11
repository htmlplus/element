import { createServer } from 'vite';
import compiler from '../../dist/compiler/index.js';
import { attach, extract, parse, print, read, uhtml, validate } from '../../dist/compiler/index.js';

const { start, next, finish } = compiler(
  read(),
  parse(),
  validate(),
  extract(),
  attach({
    typings: false
  }),
  uhtml(),
  print()
);

createServer({
  root: 'src/dev',
  server: {
    open: true
  },
  resolve: {
    alias: {
      '@htmlplus/element/runtime': '../../dist/runtime/index.js',
      '@htmlplus/element': '../../dist/client/index.js'
    }
  },
  plugins: [
    {
      name: 'htmlplus',
      async buildStart() {
        await start();
      },
      async load(id) {
        if (!id.endsWith('.tsx')) return;
        const { script } = await next(id);
        return script;
      },
      async buildEnd() {
        await finish();
      }
    }
  ]
})
  .then((server) => server.listen())
  .catch((error) => console.log(error));
