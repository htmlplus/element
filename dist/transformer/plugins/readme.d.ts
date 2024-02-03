import { TransformerPlugin, TransformerPluginContext } from '../transformer.types';
export declare const README_OPTIONS: Partial<ReadmeOptions>;
export interface ReadmeOptions {
    source?: (context: TransformerPluginContext) => string;
}
export declare const readme: (options?: ReadmeOptions) => TransformerPlugin;
