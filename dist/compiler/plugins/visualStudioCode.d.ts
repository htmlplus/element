import { Context, Plugin } from '../../types';
export declare const VISUAL_STUDIO_CODE_OPTIONS: Partial<VisualStudioCodeOptions>;
export interface VisualStudioCodeOptions {
    destination: string;
    reference?: (context: Context) => string;
    transformer?: (context: Context, component: any) => any;
}
export declare const visualStudioCode: (options: VisualStudioCodeOptions) => Plugin;
