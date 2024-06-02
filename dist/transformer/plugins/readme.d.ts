import { TransformerPlugin, TransformerPluginContext } from '../transformer.types.js';
export declare const README_OPTIONS: Partial<ReadmeOptions>;
export interface ReadmeOptions {
    source?: (context: TransformerPluginContext) => string;
}
export declare const readme: (options?: ReadmeOptions) => TransformerPlugin;
