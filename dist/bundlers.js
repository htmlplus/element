import path from "node:path";
import { createUnplugin } from "unplugin";
import { KEY } from "./constants.js";
import { transformer } from "./transformer.js";
const plugin = createUnplugin((options) => {
  const { start, run, finish } = transformer(...options);
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
    async writeBundle() {
      await finish();
    }
  };
});
const { rollup, vite } = plugin;
export {
  rollup,
  vite
};
