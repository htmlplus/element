import { TransformerPlugin, TransformerPluginContext } from '../transformer.types.js';
export declare const ASSETS_OPTIONS: Partial<AssetsOptions>;
export interface AssetsOptions {
    destination?: (context: TransformerPluginContext) => string;
    source?: (context: TransformerPluginContext) => string;
}
export declare const assets: (options?: AssetsOptions) => TransformerPlugin;
