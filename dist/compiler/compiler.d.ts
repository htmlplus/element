import { Context, Plugin } from '../types';
export declare const compiler: (...plugins: Array<Plugin>) => {
    start: () => Promise<void>;
    run: (filePath: string) => Promise<Context>;
    finish: () => Promise<void>;
};
