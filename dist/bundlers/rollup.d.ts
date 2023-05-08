import { Plugin } from '../types';
export declare const rollup: (...plugins: Array<Plugin>) => {
    name: string;
    buildStart(): Promise<void>;
    load(id: any): Promise<string | undefined>;
    buildEnd(error?: Error): Promise<void>;
};
