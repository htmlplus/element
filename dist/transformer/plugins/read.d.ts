import { TransformerPlugin } from '../transformer.types.js';
export declare const READ_OPTIONS: Partial<ReadOptions>;
export interface ReadOptions {
    encoding: 'utf8' | 'ascii' | 'utf-8' | 'utf16le' | 'utf-16le' | 'ucs2' | 'ucs-2' | 'base64' | 'base64url' | 'latin1' | 'binary' | 'hex';
    flag?: string | undefined;
}
export declare const read: (options?: ReadOptions) => TransformerPlugin;
