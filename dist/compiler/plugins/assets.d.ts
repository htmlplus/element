import { Context, Plugin } from '../../types';
export declare const ASSETS_OPTIONS: Partial<AssetsOptions>;
export type AssetsOptions = {
    once?: boolean;
    destination: (context: Context) => string;
    source?: (context: Context) => string;
};
export declare const assets: (options: AssetsOptions) => Plugin;
