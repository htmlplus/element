import { createUnplugin } from "unplugin";
import { KEY } from "./constants.js";
import { createTransformer } from "./transformer.js";
const plugin = createUnplugin((options) => {
  const { finish, transform } = createTransformer(options);
  const closeBundle = () => {
    finish();
  };
  return {
    name: KEY,
    load(id) {
      if (!id.endsWith(".tsx") && !id.endsWith(".ts")) return;
      const script = transform(id);
      return script;
    },
    rollup: { closeBundle },
    vite: { closeBundle }
  };
});
const { rollup, vite } = plugin;
export {
  rollup,
  vite
};
