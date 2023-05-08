import { Context, Plugin } from '../../../types';
export declare const CUSTOM_ELEMENT_REACT_OPTIONS: Partial<CustomElementReactOptions>;
export interface CustomElementReactOptions {
    compact?: boolean;
    destination: string;
    eventName?: (eventName: string) => string;
    importerComponent: (context: Context) => {
        source: string;
    };
    importerComponentType: (context: Context) => {
        source: string;
        imported: string;
        local: string;
    };
}
export declare const customElementReact: (options: CustomElementReactOptions) => Plugin;
