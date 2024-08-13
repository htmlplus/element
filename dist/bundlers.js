import { transformer } from './transformer.js';
import 'fs-extra';
import '@babel/template';
import '@babel/types';
import 'change-case';
import '@babel/traverse';
import '@babel/parser';
import 'glob';
import '@babel/generator';
import path from 'node:path';
import 'ora';
import './constants.js';

const rollup = (...plugins) => {
    const { start, run, finish } = transformer(...plugins);
    return {
        name: 'htmlplus',
        async buildStart() {
            await start();
        },
        async load(id) {
            if (!id.endsWith('.tsx'))
                return;
            const { script, skipped } = await run(id);
            if (skipped)
                return;
            return script;
        },
        async buildEnd(error) {
            if (error)
                throw error;
            await finish();
        }
    };
};

const vite = (...plugins) => {
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

export { rollup, vite };
