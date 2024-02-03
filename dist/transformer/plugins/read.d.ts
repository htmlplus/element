/// <reference types="node" />
import { TransformerPlugin } from '../transformer.types';
export declare const READ_OPTIONS: Partial<ReadOptions>;
export interface ReadOptions {
    encoding: BufferEncoding;
    flag?: string | undefined;
}
export declare const read: (options?: ReadOptions) => TransformerPlugin;
