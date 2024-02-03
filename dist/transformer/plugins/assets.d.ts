import { TransformerPlugin, TransformerPluginContext } from '../transformer.types';
export declare const ASSETS_OPTIONS: Partial<AssetsOptions>;
export interface AssetsOptions {
    once?: boolean;
    destination?: (context: TransformerPluginContext) => string;
    source?: (context: TransformerPluginContext) => string;
}
export declare const assets: (options?: AssetsOptions) => TransformerPlugin;
