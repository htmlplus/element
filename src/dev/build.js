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
    compact: true,
    dist: '../ports/react.new'
  }),
  uhtml(),
  print()
);

(async () => {
  await start();
  await next('./src/dev/button.tsx');
  await next('./src/dev/button-icon.tsx');
  await next('./src/dev/element.tsx');
  await finish();
})();
