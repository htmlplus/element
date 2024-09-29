import { KEY } from './constants.js';
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

const rollup = (...plugins) => {
    const { start, run, finish } = transformer(...plugins);
    return {
        name: KEY,
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
    const { global, start, run, finish } = transformer(...plugins);
    return {
        name: KEY,
        async buildStart() {
            await start();
        },
        async load(id) {
            if (!id.endsWith('.tsx'))
                return;
            const context = await run(id);
            if (context.skipped)
                return;
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
                    if (!facadeModuleId?.startsWith(context.filePath))
                        return;
                    const id = Object.keys(modules).find((key) => {
                        return key.startsWith(context.stylePath || '');
                    });
                    if (!id)
                        return;
                    context.styleContentTransformed = modules[id].code;
                });
            });
            await finish();
        }
    };
};

export { rollup, vite };
