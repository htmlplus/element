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

import type { TransformerPluginBatch, TransformerPluginContext } from '../transformer.types';

type Json = {
	$schema: string;
	name: string;
	version: string;
	'description-markup': string;
	'framework-config': {
		'enable-when': {
			'node-packages': string[];
		};
	};
	contributions: {
		html: {
			elements: {
				name: string;
				description?: string;
				'doc-url'?: string;
				attributes: {
					name: string;
					value: {
						type: string;
					};
					default?: boolean | string | number;
					description?: string;
				}[];
				js: {
					events: {
						name: string;
						description?: string;
					}[];
					properties: {
						name: string;
						default?: boolean | string | number;
						description?: string;
					}[];
				};
				slots: {
					name: string;
					description?: string;
				}[];
			}[];
		};
	};
};

export const WEB_TYPES_OPTIONS = {
	destination: path.join('dist', 'web-types.json'),
	packageName: '',
	packageVersion: '',
	reference: () => '',
	transformer: (json) => json
} satisfies WebTypesOptions;

export interface WebTypesOptions {
	destination?: string;
	packageName?: string;
	packageVersion?: string;
	reference?: (context: TransformerPluginContext) => string;
	transformer?: (json: Json) => Json;
}
export const webTypes: TransformerPluginBatch<WebTypesOptions | undefined> = (
	contexts1,
	userOptions
) => {
	const options = { ...WEB_TYPES_OPTIONS, ...userOptions };

	const contexts = contexts1.sort((a, b) => {
		return (a.elementKey ?? '').toUpperCase().localeCompare((b.elementKey ?? '').toUpperCase());
	});

	const json: Json = {
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
				elements: []
			}
		}
	};

	for (const context of contexts) {
		const element: Json['contributions']['html']['elements'][number] = {
			name: context.elementKey || '',
			'doc-url': options.reference?.(context),
			attributes: [],
			js: {
				events: [],
				properties: []
			},
			slots: [],
			...extractFromComment(context.class!, ['description', 'deprecated', 'experimental', 'slots'])
		};

		context.classProperties?.forEach((property) => {
			element.attributes.push({
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
				default: getInitializer(property.value),
				...extractFromComment(property, ['description', 'deprecated', 'experimental'])
			});
		});

		context.classEvents?.forEach((event) => {
			element.js.events.push({
				name: kebabCase(event.key['name']), // TODO
				// 'value': TODO
				...extractFromComment(event, ['description', 'deprecated', 'experimental'])
			});
		});

		context.classProperties?.forEach((property) => {
			element.js.properties.push({
				name: property.key['name'],
				// 'value': TODO
				default: getInitializer(property.value),
				...extractFromComment(property, ['description', 'deprecated', 'experimental'])
			});
		});

		context.classMethods?.forEach((method) => {
			element.js.properties.push({
				name: method.key['name'],
				// 'value': TODO
				...extractFromComment(method, ['description', 'deprecated', 'experimental'])
			});
		});

		json.contributions.html.elements.push(element);
	}

	const transformed = options.transformer?.(json) || json;

	const dirname = path.dirname(options.destination);

	fs.ensureDirSync(dirname);

	fs.writeJSONSync(options.destination, transformed, {
		encoding: 'utf8',
		spaces: 2
	});
};
