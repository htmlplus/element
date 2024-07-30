import path from 'path';
import { transformer } from '../transformer/index.js';
export const htmlplus = (...plugins) => {
    const { global, start, run, finish, write } = transformer(...plugins);
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
        },
        async writeBundle(options, bundles) {
            // TODO
            try {
                for (const context of global.contexts) {
                    for (const key in bundles) {
                        if (!Object.hasOwnProperty.call(bundles, key))
                            continue;
                        const bundle = bundles[key];
                        if (!bundle.facadeModuleId.startsWith(context.filePath))
                            continue;
                        const modules = bundle['modules'];
                        for (const key in modules) {
                            if (!Object.hasOwnProperty.call(modules, key))
                                continue;
                            const module = modules[key];
                            if (!key.startsWith(context.stylePath || ''))
                                continue;
                            context.styleContentTransformed = module.code;
                            break;
                        }
                        break;
                    }
                }
            }
            catch { }
            await write();
        }
    };
};
