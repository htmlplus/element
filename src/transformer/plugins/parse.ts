import { type ParserOptions, parse as parser } from '@babel/parser';

import type { TransformerPlugin, TransformerPluginContext } from '../transformer.types';

export const PARSE_OPTIONS: ParseOptions = {
	sourceType: 'module',
	plugins: [['decorators', { decoratorsBeforeExport: true }], 'jsx', 'typescript']
};

export interface ParseOptions extends ParserOptions {}

export const parse = (userOptions?: ParseOptions): TransformerPlugin => {
	const name = 'parse';

	const options = Object.assign({}, PARSE_OPTIONS, userOptions) as Required<ParseOptions>;

	const run = (context: TransformerPluginContext) => {
		context.fileAST = parser(context.fileContent || '', options);
	};

	return { name, run };
};
