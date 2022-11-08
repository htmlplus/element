import { compiler } from '../../compiler/index.js';
import plugins from '../plus.config.js';

const { start, next, finish } = compiler(...plugins);

(async () => {
  await start();

  const result = await next('./src/development/components/element.tsx');

  console.log(result.script);

  await finish();
})();
