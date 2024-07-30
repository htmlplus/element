import { TransformerPlugin, TransformerPluginContext, TransformerPluginGlobal } from './transformer.types.js';
export declare const transformer: (...plugins: TransformerPlugin[]) => {
    global: TransformerPluginGlobal;
    start: () => Promise<void>;
    run: (filePath: string) => Promise<TransformerPluginContext>;
    finish: () => Promise<void>;
    write: () => Promise<void>;
};
