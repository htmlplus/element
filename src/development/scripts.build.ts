import { transformer } from '../transformer/index.js';
import plugins from './htmlplus.config.js';

const { start, run, finish } = transformer(...plugins);

(async () => {
  await start();

  const result = await run('./src/development/my-counter.tsx');

  console.log(result.script);

  await finish();
})();
