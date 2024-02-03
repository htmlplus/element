import { TransformerPlugin, TransformerPluginContext } from '../transformer.types';
export declare const STYLE_OPTIONS: Partial<StyleOptions>;
export interface StyleOptions {
    source?: (context: TransformerPluginContext) => string | string[];
}
export declare const style: (options?: StyleOptions) => TransformerPlugin;
