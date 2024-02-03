import path from 'path';
import { transformer } from '../transformer/index.js';
export const htmlplus = (...plugins) => {
    const { start, run, finish } = transformer(...plugins);
    return {
        name: 'htmlplus',
        async buildStart() {
            await start();
        },
        async load(id) {
            if (!id.endsWith('.tsx'))
                return;
            let { script, skipped, stylePath } = await run(id);
            if (skipped)
                return;
            if (script && stylePath) {
                script = script.replace(path.basename(stylePath), `${path.basename(stylePath)}?inline`);
            }
            return script;
        },
        async buildEnd() {
            await finish();
        }
    };
};
