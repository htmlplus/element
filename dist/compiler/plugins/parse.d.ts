import { ParserOptions } from '@babel/parser';
import { Plugin } from '../../types';
export declare const PARSE_OPTIONS: Partial<ParseOptions>;
export type ParseOptions = ParserOptions;
export declare const parse: (options?: ParseOptions) => Plugin;
