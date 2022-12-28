import { parse as parser, ParserOptions } from '@babel/parser';

import { Context, Plugin } from '../../types';

export const PARSE_OPTIONS: Partial<ParseOptions> = {
  sourceType: 'module',
  plugins: [['decorators', { decoratorsBeforeExport: true }], 'jsx', 'typescript']
};

export type ParseOptions = ParserOptions;

export const parse = (options?: ParseOptions): Plugin => {
  const name = 'parse';

  options = Object.assign({}, PARSE_OPTIONS, options);

  const run = (context: Context) => {
    context.fileAST = context.fileAST ?? parser(context.fileContent!, options);
  };

  return { name, run };
};
