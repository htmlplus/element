import { Context, Plugin } from '../../types';
export declare const WEB_TYPES_OPTIONS: Partial<WebTypesOptions>;
export interface WebTypesOptions {
    destination: string;
    packageName: string;
    packageVersion: string;
    reference?: (context: Context) => string;
    transformer?: (context: Context, component: any) => any;
}
export declare const webTypes: (options: WebTypesOptions) => Plugin;
