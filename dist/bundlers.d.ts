import { TransformerPlugin } from './transformer.js';
import '@babel/types';
import '@babel/parser';

declare const rollup: (...plugins: TransformerPlugin[]) => {
    name: string;
    buildStart(): Promise<void>;
    load(id: string): Promise<string | undefined>;
    buildEnd(error?: Error): Promise<void>;
};

declare const vite: (...plugins: TransformerPlugin[]) => {
    name: string;
    buildStart(): Promise<void>;
    load(id: string): Promise<string | undefined>;
    writeBundle(_options: any, bundles: any): Promise<void>;
};

export { rollup, vite };
