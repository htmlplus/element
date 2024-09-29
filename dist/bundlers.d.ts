import { TransformerPlugin } from './transformer.js';
import '@babel/types';
import '@babel/parser';

declare const rollup: (...plugins: Array<TransformerPlugin>) => {
    name: string;
    buildStart(): Promise<void>;
    load(id: any): Promise<string | undefined>;
    buildEnd(error?: Error): Promise<void>;
};

declare const vite: (...plugins: Array<TransformerPlugin>) => {
    name: string;
    buildStart(): Promise<void>;
    load(id: any): Promise<string | undefined>;
    writeBundle(options: any, bundles: any): Promise<void>;
};

export { rollup, vite };
