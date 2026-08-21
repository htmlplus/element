import { createUnplugin } from "unplugin";
import { KEY } from "./constants.js";
import { transformer } from "./transformer.js";
const plugin = createUnplugin((options) => {
  const { transform, finish } = transformer(options);
  return {
    name: KEY,
    load(id) {
      if (!id.endsWith(".tsx")) return;
      const context = transform(id);
      if (context.skipped) return;
      return context.script;
    },
    writeBundle() {
      finish();
    }
  };
});
const { rollup, vite } = plugin;
export {
  rollup,
  vite
};
