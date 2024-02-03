import { TransformerPlugin, TransformerPluginContext } from '../../transformer.types';
export declare const CUSTOM_ELEMENT_REACT_OPTIONS: Partial<CustomElementReactOptions>;
export interface CustomElementReactOptions {
    compact?: boolean;
    destination: string;
    eventName?: (eventName: string) => string;
    importerElement: (context: TransformerPluginContext) => {
        source: string;
    };
    importerElementType: (context: TransformerPluginContext) => {
        source: string;
        imported: string;
        local: string;
    };
}
export declare const customElementReact: (options: CustomElementReactOptions) => TransformerPlugin;
