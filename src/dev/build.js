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
    dist: '../ports/react.new',
    corePackageName: '@htmlplus/components'
  }),
  uhtml(),
  print()
);

(async () => {
  await start();
  await next('./src/dev/button.tsx');
  await next('./src/dev/element.tsx');
  await finish();
})();
