import { compiler } from '../compiler/index.js';
import { Plugin } from '../types';

export const rollup = (...plugins: Array<Plugin>) => {
  const { start, next, finish } = compiler(...plugins);
  return {
    name: 'htmlplus',
    async buildStart() {
      await start();
    },
    async load(id) {
      if (!id.endsWith('.tsx')) return;
      const { isInvalid, script } = await next(id);
      if (isInvalid) return;
      return script;
    },
    async buildEnd() {
      await finish();
    }
  };
};
