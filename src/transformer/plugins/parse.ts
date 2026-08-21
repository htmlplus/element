import { type ParserOptions, parse as parser } from '@babel/parser';

import type { TransformerPlugin } from '../transformer.types';

export const PARSE_OPTIONS: ParseOptions = {
	sourceType: 'module',
	plugins: [['decorators', { decoratorsBeforeExport: true }], 'jsx', 'typescript']
};

export interface ParseOptions extends ParserOptions {}

export const parse: TransformerPlugin<ParseOptions | undefined> = (context, userOptions) => {
	const options = { ...PARSE_OPTIONS, ...userOptions };

	context.fileAST = parser(context.fileContent || '', options);
};
