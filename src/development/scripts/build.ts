import { compiler } from '../../compiler/index.js';
import plugins from '../plus.config.js';

const { start, run, finish } = compiler(...plugins);

(async () => {
  await start();

  const result = await run('./src/development/components/element.tsx');

  console.log(result.script);

  await finish();
})();
