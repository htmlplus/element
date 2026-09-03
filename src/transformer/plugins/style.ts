import path from 'node:path';

import fs from 'fs-extra';

import * as CONSTANTS from '@/constants';

import type { TransformerContext, TransformerElement } from '../transformer.types';
import { hasStaticClassProperty } from '../utils';

export const STYLE_OPTIONS = {
	resolver(_context, element) {
		return `${element.stylePath}?inline`;
	},
	source(context) {
		return ['css', 'less', 'sass', 'scss', 'styl'].map((key) => {
			return path.join(context.directoryPath, `${context.fileName}.${key}`);
		});
	}
} satisfies StyleOptions;

export type StyleOptions = {
	resolver?: (context: TransformerContext, element: TransformerElement) => string;
	source?: (context: TransformerContext, element: TransformerElement) => string | string[];
};

export const style = (context: TransformerContext, userOptions?: StyleOptions): void => {
	const options = { ...STYLE_OPTIONS, ...userOptions };

	for (const element of context.elements) {
		element.stylePath = [options.source(context, element)]
			.flat()
			.find((source) => fs.existsSync(source));

		if (!element.stylePath) continue;

		if (!Object.getOwnPropertyDescriptor(element, 'styleContent')?.get) {
			Object.defineProperty(element, 'styleContent', {
				configurable: true,
				enumerable: true,
				get() {
					return fs.readFileSync(element.stylePath, 'utf8');
				}
			});
		}

		element.styleExtension = path.extname(element.stylePath);

		element.styleName = path.basename(element.stylePath, element.styleExtension);

		const exists = hasStaticClassProperty(element.node, CONSTANTS.STATIC_STYLE);

		if (exists) continue;

		const local = `${CONSTANTS.STYLE_IMPORTED}_${element.name}`;

		context.script.prepend(`\nimport ${local} from '${options.resolver(context, element)}';\n`);

		context.script.prependLeft(
			element.node.members.pos,
			`\nstatic readonly ${CONSTANTS.STATIC_STYLE} = ${local};\n`
		);
	}
};
