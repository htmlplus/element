import { TransformerPlugin, TransformerPluginContext } from '../transformer.types';
export declare const VISUAL_STUDIO_CODE_OPTIONS: Partial<VisualStudioCodeOptions>;
export interface VisualStudioCodeOptions {
    destination: string;
    reference?: (context: TransformerPluginContext) => string;
    transformer?: (context: TransformerPluginContext, component: any) => any;
}
export declare const visualStudioCode: (options: VisualStudioCodeOptions) => TransformerPlugin;
