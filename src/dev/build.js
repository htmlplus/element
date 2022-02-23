import compiler from '../../dist/compiler/index.js';
import { attach, extract, parse, print, reactProxy, read, uhtml, validate } from '../../dist/compiler/index.js';

const { start, next, finish } = compiler(
  read(),
  parse(),
  validate(),
  extract(),
  attach({
    typings: false
  }),
  reactProxy({
    dist: 'dist/react-port'
  }),
  uhtml(),
  print()
);

(async () => {
  await start();
  const { script } = await next('./src/dev/element.tsx');
  await finish();
})();
