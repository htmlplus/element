# Element Compiler

```js
import { compiler } from '@htmlplus/element/compiler';

const { start, next, finish } = compiler(
  ...plugins
);
```

```js
import { compiler, plugins } from '@htmlplus/element/compiler';

const { start, next, finish } = compiler(
  plugins.read(),
  plugins.parse(),
  plugins.extract({
    prefix: 'plus',
  }),
  plugins.attach({
    members: true,
    styles: true,
  }),
  plugins.uhtml(),
  plugins.print(),
);

await start();

const { script } = await next('element.tsx');

await finish();
```