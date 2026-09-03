import path from 'node:path';

import fs from 'fs-extra';
import ts from 'typescript';

import { getTypeChecker } from '../core';
import type { TransformerContext, TransformerElement } from '../transformer.types';
import { getDescription } from '../utils';

export type VisualStudioCodeJson = Record<string, unknown>;

export const VISUAL_STUDIO_CODE_OPTIONS = {
	destination: path.join('dist', 'visual-studio-code.json'),
	reference: () => '',
	transform: (json) => json
} satisfies VisualStudioCodeOptions;

export type VisualStudioCodeOptions<T = VisualStudioCodeJson> = {
	destination?: string;
	reference?: (context: TransformerContext, element: TransformerElement) => string;
	transform?: (json: VisualStudioCodeJson) => T;
};

const getValues = (type: ts.Type): string[] => {
	if (type.flags & ts.TypeFlags.BooleanLike) {
		return ['false', 'true'];
	}

	if (type.isUnion()) {
		return [...new Set(type.types.flatMap((member) => getValues(member)))];
	}

	if (type.flags & ts.TypeFlags.EnumLiteral && type.symbol) {
		return [type.symbol.name];
	}

	if (type.isStringLiteral()) {
		return [type.value];
	}

	if (type.isNumberLiteral()) {
		return [String(type.value)];
	}

	return [];
};

export const visualStudioCode = (
	contexts: TransformerContext[],
	userOptions?: VisualStudioCodeOptions
): void => {
	const options = { ...VISUAL_STUDIO_CODE_OPTIONS, ...userOptions };

	const entries = contexts
		.flatMap((context) => context.elements.map((element) => ({ context, element })))
		.sort((a, b) => (a.element.key > b.element.key ? +1 : -1));

	const tags = entries.map(({ context, element }) => {
		const attributes = element.properties.map((property) => {
			const checker = getTypeChecker(property.node);

			const type = checker.getTypeAtLocation(property.node);

			return {
				name: property.attribute,
				values: getValues(type)
					.sort()
					.map((name) => ({ name })),
				description: property.description
			};
		});

		return {
			name: element.key,
			attributes,
			references: [
				{
					name: 'Source code',
					url: options.reference(context, element)
				}
			],
			description: getDescription(element.node)
		};
	});

	const json: VisualStudioCodeJson = {
		$schema: 'TODO',
		version: 1.1,
		tags
	};

	const transformed = options.transform(json);

	const dirname = path.dirname(options.destination);

	fs.ensureDirSync(dirname);

	fs.writeJSONSync(options.destination, transformed, {
		encoding: 'utf8',
		spaces: 2
	});
};
