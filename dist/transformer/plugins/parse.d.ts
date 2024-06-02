import { ParserOptions } from '@babel/parser';
import { TransformerPlugin } from '../transformer.types.js';
export declare const PARSE_OPTIONS: Partial<ParseOptions>;
export interface ParseOptions extends ParserOptions {
}
export declare const parse: (options?: ParseOptions) => TransformerPlugin;
