/// <reference types="node" />
import { Plugin } from '../../types';
export declare const READ_OPTIONS: Partial<ReadOptions>;
export type ReadOptions = {
    encoding: BufferEncoding;
    flag?: string | undefined;
};
export declare const read: (options?: ReadOptions) => Plugin;
