import path from 'path';

import * as CONSTANTS from '../constants/index.js';
import { TransformerPlugin, transformer } from '../transformer/index.js';

export const vite = (...plugins: Array<TransformerPlugin>) => {
  const { global, start, run, finish } = transformer(...plugins);

  return {
    name: CONSTANTS.KEY,

    async buildStart() {
      await start();
    },

    async load(id) {
      if (!id.endsWith('.tsx')) return;

      const context = await run(id);

      if (context.skipped) return;

      if (context.script && context.stylePath) {
        context.script = context.script.replace(path.basename(context.stylePath), `$&?inline`);
      }

      return context.script;
    },

    async writeBundle(options, bundles) {
      // TODO
      global.contexts.forEach((context) => {
        Object.keys(bundles).forEach((key) => {
          const { facadeModuleId, modules } = bundles[key];
          if (!facadeModuleId?.startsWith(context.filePath)) return;
          const id = Object.keys(modules).find((key) => {
            return key.startsWith(context.stylePath || '');
          });
          if (!id) return;
          context.styleContentTransformed = modules[id].code;
        });
      });

      await finish();
    }
  };
};
