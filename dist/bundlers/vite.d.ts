import { Plugin } from '../types';
export declare const vite: (...plugins: Array<Plugin>) => {
    name: string;
    buildStart(): Promise<void>;
    load(id: any): Promise<string | undefined>;
    buildEnd(): Promise<void>;
};
