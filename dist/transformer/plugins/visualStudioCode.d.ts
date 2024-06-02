import { TransformerPlugin, TransformerPluginContext } from '../transformer.types.js';
export declare const VISUAL_STUDIO_CODE_OPTIONS: Partial<VisualStudioCodeOptions>;
export interface VisualStudioCodeOptions {
    destination?: string;
    reference?: (context: TransformerPluginContext) => string;
    transformer?: (context: TransformerPluginContext, element: any) => any;
}
export declare const visualStudioCode: (options?: VisualStudioCodeOptions) => TransformerPlugin;
