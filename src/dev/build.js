import compiler from '../../dist/compiler/index.js';
import {
  attach,
  componentDependencyResolver,
  extract,
  parse,
  print,
  read,
  scss,
  style,
  uhtml,
  validate
} from '../../dist/compiler/index.js';

const { start, next, finish } = compiler(
  read(),
  parse(),
  validate(),
  extract(),
  componentDependencyResolver(),
  style(),
  scss(),
  attach({
    typings: false
  }),
  uhtml(),
  print()
);

(async () => {
  await start();

  const another = await next('./src/dev/another.tsx');
  console.log(1, another.script);

  const element = await next('./src/dev/element.tsx');
  console.log(2, element.script);

  const text = await next('./src/dev/text.tsx');
  console.log(3, text.script);

  await finish();
})();
