import { TransformerPlugin } from '../transformer.types.js';
export declare const CUSTOM_ELEMENT_OPTIONS: Partial<CustomElementOptions>;
export interface CustomElementOptions {
    prefix?: string;
    typings?: boolean;
}
export declare const customElement: (options?: CustomElementOptions) => TransformerPlugin;
