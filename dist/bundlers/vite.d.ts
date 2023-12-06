import { TransformerPlugin } from '../transformer/index.js';
export declare const htmlplus: (...plugins: Array<TransformerPlugin>) => {
    name: string;
    buildStart(): Promise<void>;
    load(id: any): Promise<string | undefined>;
    buildEnd(): Promise<void>;
};
