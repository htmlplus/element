import { TransformerPlugin, TransformerPluginContext } from '../transformer.types.js';
export declare const DOCUMENT_OPTIONS: Partial<DocumentOptions>;
export interface DocumentOptions {
    destination: string;
    transformer?: (context: TransformerPluginContext, element: any) => any;
}
export declare const document: (options?: DocumentOptions) => TransformerPlugin;
