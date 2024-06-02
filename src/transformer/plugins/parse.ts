import { parse as parser, ParserOptions } from '@babel/parser';

import { TransformerPlugin, TransformerPluginContext } from '../transformer.types.js';

export const PARSE_OPTIONS: Partial<ParseOptions> = {
  sourceType: 'module',
  plugins: [['decorators', { decoratorsBeforeExport: true }], 'jsx', 'typescript']
};

export interface ParseOptions extends ParserOptions {}

export const parse = (options?: ParseOptions): TransformerPlugin => {
  const name = 'parse';

  options = Object.assign({}, PARSE_OPTIONS, options);

  const run = (context: TransformerPluginContext) => {
    context.fileAST = parser(context.fileContent!, options);
  };

  return { name, run };
};
