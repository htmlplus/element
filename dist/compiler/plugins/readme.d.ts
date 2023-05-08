import { Context, Plugin } from '../../types';
export declare const README_OPTIONS: Partial<ReadmeOptions>;
export type ReadmeOptions = {
    source?: (context: Context) => string;
};
export declare const readme: (options: ReadmeOptions) => Plugin;
