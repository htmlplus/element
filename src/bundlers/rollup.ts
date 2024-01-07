import { TransformerPlugin, transformer } from '../transformer/index.js';

export const htmlplus = (...plugins: Array<TransformerPlugin>) => {
  const { start, run, finish } = transformer(...plugins);

  return {
    name: 'htmlplus',

    async buildStart() {
      await start();
    },

    async load(id) {
      if (!id.endsWith('.tsx')) return;

      const { script, skipped } = await run(id);

      if (skipped) return;

      return script;
    },

    async buildEnd(error?: Error) {
      if (error) throw error;
      await finish();
    }
  };
};
