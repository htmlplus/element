import path from 'node:path';

import t from '@babel/types';
import fs from 'fs-extra';

import * as CONSTANTS from '@/constants';
import { addDependency } from '@/transformer/utils';

import type {
	InvertOptional,
	TransformerPlugin,
	TransformerPluginContext
} from '../transformer.types';

export const STYLE_OPTIONS: InvertOptional<StyleOptions> = {
	source(context) {
		return ['css', 'less', 'sass', 'scss', 'styl'].map((key) => {
			return path.join(context.directoryPath || '', `${context.fileName}.${key}`);
		});
	}
};

export interface StyleOptions {
	source?: (context: TransformerPluginContext) => string | string[];
}

export const style = (userOptions?: StyleOptions): TransformerPlugin => {
	const name = 'style';

	const options = Object.assign({}, STYLE_OPTIONS, userOptions) as Required<StyleOptions>;

	const run = (context: TransformerPluginContext) => {
		const sources = [options.source(context)].flat();

		for (const source of sources) {
			if (!source) continue;

			if (!fs.existsSync(source)) continue;

			context.stylePath = source;

			break;
		}

		if (!context.stylePath) return;

		context.styleContent = fs.readFileSync(context.stylePath, 'utf8');

		context.styleExtension = path.extname(context.stylePath);

		context.styleName = path.basename(context.stylePath, context.styleExtension);

		if (!context.fileAST) return;

		const { local } = addDependency(
			context.fileAST,
			context.stylePath,
			CONSTANTS.STYLE_IMPORTED,
			undefined,
			true
		);

		const property = t.classProperty(
			t.identifier(CONSTANTS.STATIC_STYLE),
			t.identifier(local || ''),
			undefined,
			null,
			undefined,
			true
		);

		t.addComment(property, 'leading', CONSTANTS.COMMENT_AUTO_ADDED, true);

		context.class?.body.body.unshift(property);
	};

	return { name, run };
};
