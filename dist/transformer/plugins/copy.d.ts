import { TransformerPlugin } from '../transformer.types.js';
export declare const COPY_OPTIONS: Partial<CopyOptions>;
export interface CopyOptions {
    at?: 'start' | 'run' | 'finish';
    destination: string;
    source: string;
    transformer?: (content: string) => string;
}
export declare const copy: (options: CopyOptions) => TransformerPlugin;
