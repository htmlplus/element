import { parse as parser, ParserOptions } from '@babel/parser';

import { Context } from '../../types';

export const PARSE_OPTIONS: Partial<ParseOptions> = {
  sourceType: 'module',
  plugins: [['decorators', { decoratorsBeforeExport: true }], 'jsx', 'typescript']
};

export type ParseOptions = ParserOptions;

export const parse = (options?: ParseOptions) => {
  const name = 'parse';

  options = Object.assign({}, PARSE_OPTIONS, options);

  const next = (context: Context) => {
    context.fileAST = context.fileAST ?? parser(context.fileContent!, options);
  };

  return { name, next };
};
