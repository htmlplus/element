import { kebabCase } from 'change-case';

import * as CONSTANTS from '@/constants';

import type { TransformerContext } from '../transformer.types';
import { hasStaticClassProperty } from '../utils';

export const tag = (context: TransformerContext): void => {
	for (const element of context.elements) {
		const exists = hasStaticClassProperty(element.node, CONSTANTS.STATIC_TAG);

		if (exists) continue;

		const elementTagName = kebabCase(element.name);

		context.script.prependLeft(
			element.node.members.pos,
			`\nstatic readonly ${CONSTANTS.STATIC_TAG} = '${elementTagName}';\n`
		);
	}
};
