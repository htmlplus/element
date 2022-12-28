import { compiler } from '../compiler/index.js';
import { Plugin } from '../types';

export const rollup = (...plugins: Array<Plugin>) => {
  const { start, run, finish } = compiler(...plugins);
  return {
    name: 'htmlplus',
    async buildStart() {
      await start();
    },
    async load(id) {
      if (!id.endsWith('.tsx')) return;
      const { isInvalid, script } = await run(id);
      if (isInvalid) return;
      return script;
    },
    async buildEnd() {
      await finish();
    }
  };
};
