import path from 'node:path';

import t from '@babel/types';
import fs from 'fs-extra';

import * as CONSTANTS from '@/constants';
import { addDependency } from '@/transformer/utils';

import type { TransformerPlugin, TransformerPluginContext } from '../transformer.types';

export const STYLE_OPTIONS = {
	source(context) {
		return ['css', 'less', 'sass', 'scss', 'styl'].map((key) => {
			return path.join(context.directoryPath || '', `${context.fileName}.${key}`);
		});
	}
} satisfies StyleOptions;

export interface StyleOptions {
	source?: (context: TransformerPluginContext) => string | string[];
}

export const style: TransformerPlugin<StyleOptions | undefined> = (context, userOptions) => {
	const options = { ...STYLE_OPTIONS, ...userOptions };

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

	const exists = context.class?.body.body.some((node) => {
		return (
			t.isClassProperty(node) &&
			node.static &&
			t.isIdentifier(node.key) &&
			node.key.name === CONSTANTS.STATIC_STYLE
		);
	});

	if (exists) return;

	const { local } = addDependency(
		context.fileAST,
		`${context.stylePath}?inline`,
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
