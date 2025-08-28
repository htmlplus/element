// biome-ignore-all lint: TODO

import path from 'node:path';

import { kebabCase } from 'change-case';
import fs from 'fs-extra';

import {
	extractAttribute,
	extractFromComment,
	getInitializer,
	getType,
	print
} from '@/transformer/utils';

import type {
	InvertOptional,
	TransformerPlugin,
	TransformerPluginContext,
	TransformerPluginGlobal
} from '../transformer.types';

export const WEB_TYPES_OPTIONS: InvertOptional<WebTypesOptions> = {
	destination: path.join('dist', 'web-types.json'),
	packageName: '',
	packageVersion: '',
	reference: () => '',
	transformer: (_context, element) => element
};

export interface WebTypesOptions {
	destination?: string;
	packageName?: string;
	packageVersion?: string;
	reference?: (context: TransformerPluginContext) => string;
	transformer?: (context: TransformerPluginContext, element: unknown) => unknown;
}

export const webTypes = (userOptions?: WebTypesOptions): TransformerPlugin => {
	const name = 'webTypes';

	const options = Object.assign({}, WEB_TYPES_OPTIONS, userOptions) as Required<WebTypesOptions>;

	const finish = (global: TransformerPluginGlobal) => {
		const contexts = global.contexts.sort((a, b) => {
			return (a.elementKey ?? '').toUpperCase().localeCompare((b.elementKey ?? '').toUpperCase());
		});

		const json = {
			$schema: 'http://json.schemastore.org/web-types',
			name: options.packageName,
			version: options.packageVersion,
			'description-markup': 'markdown',
			'framework-config': {
				'enable-when': {
					'node-packages': [options.packageName]
				}
			},
			contributions: {
				html: {
					elements: [] as unknown[]
				}
			}
		};

		for (const context of contexts) {
			const attributes = context.classProperties?.map((property) =>
				Object.assign(
					{
						name: extractAttribute(property) || kebabCase(property.key['name']),
						value: {
							// kind: TODO
							type: print(
								getType(
									context.directoryPath!,
									context.fileAST!,
									property.typeAnnotation?.['typeAnnotation']
								)
							)
							// required: TODO
							// default: TODO
						},
						default: getInitializer(property.value)
					},
					extractFromComment(property, ['description', 'deprecated', 'experimental'])
				)
			);

			const events = context.classEvents?.map((event) =>
				Object.assign(
					{
						name: kebabCase(event.key['name']) // TODO
						// 'value': TODO
					},
					extractFromComment(event, ['description', 'deprecated', 'experimental'])
				)
			);

			const methods = context.classMethods?.map((method) =>
				Object.assign(
					{
						name: method.key['name']
						// 'value': TODO
					},
					extractFromComment(method, ['description', 'deprecated', 'experimental'])
				)
			);

			const properties = context.classProperties?.map((property) =>
				Object.assign(
					{
						name: property.key['name'],
						// 'value': TODO
						default: getInitializer(property.value)
					},
					extractFromComment(property, ['description', 'deprecated', 'experimental'])
				)
			);

			const element = Object.assign(
				{
					name: context.elementKey,
					'doc-url': options.reference?.(context),
					js: {
						events,
						properties: ([] as any).concat(properties, methods)
					},
					attributes
				},
				extractFromComment(context.class!, ['description', 'deprecated', 'experimental', 'slots'])
			);

			const transformed = options.transformer?.(context, element) || element;

			json.contributions.html.elements.push(transformed);
		}

		const dirname = path.dirname(options.destination);

		fs.ensureDirSync(dirname);

		fs.writeJSONSync(options.destination, json, {
			encoding: 'utf8',
			spaces: 2
		});
	};

	return { name, finish };
};
