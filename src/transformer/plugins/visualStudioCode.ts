// biome-ignore-all lint: TODO

import path from 'node:path';

import { kebabCase } from 'change-case';
import fs from 'fs-extra';

import { extractAttribute, extractFromComment, getType, print } from '@/transformer/utils';

import type { TransformerPluginBatch, TransformerPluginContext } from '../transformer.types';

type Json = {
	$schema: string;
	version: number;
	tags: {
		name: string;
		attributes: {
			name: string;
			values: {
				name: string;
			}[];
			description?: string;
		}[];
		references: {
			name: string;
			url: string;
		}[];
		description?: string;
	}[];
};

export const VISUAL_STUDIO_CODE_OPTIONS = {
	destination: path.join('dist', 'visual-studio-code.json'),
	reference: () => '',
	transformer: (json) => json
} satisfies VisualStudioCodeOptions;

export interface VisualStudioCodeOptions {
	destination?: string;
	reference?: (context: TransformerPluginContext) => string;
	transformer?: (json: Json) => Json;
}

export const visualStudioCode: TransformerPluginBatch<VisualStudioCodeOptions | undefined> = (
	contexts1,
	userOptions
) => {
	const options = { ...VISUAL_STUDIO_CODE_OPTIONS, ...userOptions };

	const contexts = contexts1.sort((a, b) => {
		return a.elementKey!.toUpperCase() > b.elementKey!.toUpperCase() ? +1 : -1;
	});

	const json: Json = {
		$schema: 'TODO',
		version: 1.1,
		tags: []
	};

	for (const context of contexts) {
		const tag: Json['tags'][number] = {
			name: context.elementKey!,
			attributes: [],
			references: [
				{
					name: 'Source code',
					url: options.reference?.(context) || ''
				}
			],
			...extractFromComment(context.class!, ['description'])
		};

		for (const property of context.classProperties || []) {
			const attribute: Json['tags'][number]['attributes'][number] = {
				name: extractAttribute(property) || kebabCase(property.key['name']),
				values: [],
				...extractFromComment(property, ['description'])
			};

			const type = print(
				getType(
					context.directoryPath!,
					context.fileAST!,
					property.typeAnnotation?.['typeAnnotation']
				)
			);

			const sections = type.split('|');

			for (const section of sections) {
				const trimmed = section.trim();

				if (!trimmed) continue;

				const isBoolean = /bool|boolean|Boolean/.test(trimmed);

				const isNumber = !isNaN(trimmed as any);

				const isString = /^("|'|`)/.test(trimmed);

				if (isBoolean) {
					attribute.values.push(
						{
							name: 'false'
						},
						{
							name: 'true'
						}
					);
				} else if (isNumber) {
					attribute.values.push({
						name: trimmed
					});
				} else if (isString) {
					attribute.values.push({
						name: trimmed.slice(1, -1)
					});
				}
			}

			tag.attributes.push(attribute);
		}

		json.tags.push(tag);
	}

	const transformed = options.transformer?.(json) || json;

	const dirname = path.dirname(options.destination);

	fs.ensureDirSync(dirname);

	fs.writeJSONSync(options.destination, transformed, {
		encoding: 'utf8',
		spaces: 2
	});
};
