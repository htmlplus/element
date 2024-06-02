import { TransformerPlugin, TransformerPluginContext } from '../transformer.types.js';
export declare const WEB_TYPES_OPTIONS: Partial<WebTypesOptions>;
export interface WebTypesOptions {
    destination?: string;
    packageName?: string;
    packageVersion?: string;
    reference?: (context: TransformerPluginContext) => string;
    transformer?: (context: TransformerPluginContext, element: any) => any;
}
export declare const webTypes: (options?: WebTypesOptions) => TransformerPlugin;
