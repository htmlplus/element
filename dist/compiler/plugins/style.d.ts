import { Context, Plugin } from '../../types';
export declare const STYLE_OPTIONS: Partial<StyleOptions>;
export type StyleOptions = {
    source?: (context: Context) => string | string[];
};
export declare const style: (options?: StyleOptions) => Plugin;
