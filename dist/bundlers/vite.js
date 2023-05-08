import path from 'path';
import { compiler } from '../compiler/index.js';
export const vite = (...plugins) => {
    const { start, run, finish } = compiler(...plugins);
    return {
        name: 'htmlplus',
        async buildStart() {
            await start();
        },
        async load(id) {
            if (!id.endsWith('.tsx'))
                return;
            let { isInvalid, script, stylePath } = await run(id);
            if (isInvalid)
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
