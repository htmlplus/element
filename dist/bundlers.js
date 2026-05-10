import { KEY } from "./constants.js";
import { transformer } from "./transformer.js";
import path from "node:path";
const rollup = (...plugins) => {
  const { start, run, finish } = transformer(...plugins);
  return {
    name: KEY,
    async buildStart() {
      await start();
    },
    async load(id) {
      if (!id.endsWith(".tsx")) return;
      const { script, skipped } = await run(id);
      if (skipped) return;
      return script;
    },
    async buildEnd(error) {
      if (error) throw error;
      await finish();
    }
  };
};
const vite = (...plugins) => {
  const { global, start, run, finish } = transformer(...plugins);
  return {
    name: KEY,
    async buildStart() {
      await start();
    },
    async load(id) {
      if (!id.endsWith(".tsx")) return;
      const context = await run(id);
      if (context.skipped) return;
      if (context.script && context.stylePath) {
        context.script = context.script.replace(path.basename(context.stylePath), `$&?inline`);
      }
      return context.script;
    },
    async writeBundle(_options, bundles) {
      global.contexts.forEach((context) => {
        Object.keys(bundles).forEach((key) => {
          const { facadeModuleId, modules } = bundles[key];
          if (!facadeModuleId?.startsWith(context.filePath)) return;
          const id = Object.keys(modules).find((key2) => {
            return key2.startsWith(context.stylePath || "");
          });
          if (!id) return;
          context.styleContentTransformed = modules[id].code;
        });
      });
      await finish();
    }
  };
};
export {
  rollup,
  vite
};
