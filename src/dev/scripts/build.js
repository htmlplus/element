import compiler from '../../../dist/compiler/index.js';
import { attach, customElement, extract, parse, read, style, validate } from '../../../dist/compiler/index.js';

const { start, next, finish } = compiler(
  read(),
  parse(),
  validate(),
  extract(),
  style(),
  attach({
    typings: false
  }),
  customElement()
);

(async () => {
  await start();

  const another = await next('./src/dev/components/another.tsx');
  // console.log(1, another.script);

  const element = await next('./src/dev/components/element.tsx');
  // console.log(2, element.script);

  const text = await next('./src/dev/components/text.tsx');
  // console.log(3, text.script);

  await finish();
})();
