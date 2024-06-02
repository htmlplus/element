import { TransformerPlugin, TransformerPluginContext } from './transformer.types.js';
export declare const transformer: (...plugins: TransformerPlugin[]) => {
    start: () => Promise<void>;
    run: (filePath: string) => Promise<TransformerPluginContext>;
    finish: () => Promise<void>;
};
