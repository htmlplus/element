import path from 'node:path';

import { kebabCase } from 'change-case';
import fs from 'fs-extra';

import type { TransformerContext, TransformerElement } from '../transformer.types';
import { getDescription, getTags, parseNamedTag, toDeprecated } from '../utils';

export type WebTypesJson = Record<string, unknown>;

export type WebTypesOptions<T = WebTypesJson> = {
	destination?: string;
	packageName?: string;
	packageVersion?: string;
	reference?: (context: TransformerContext, element: TransformerElement) => string;
	transform?: (json: WebTypesJson) => T;
};

export const WEB_TYPES_OPTIONS = {
	destination: path.join('dist', 'web-types.json'),
	packageName: '',
	packageVersion: '',
	reference: () => '',
	transform: (json) => json
} satisfies WebTypesOptions;

export const webTypes = (contexts: TransformerContext[], userOptions?: WebTypesOptions): void => {
	const options = { ...WEB_TYPES_OPTIONS, ...userOptions };

	const entries = contexts
		.flatMap((context) => context.elements.map((element) => ({ context, element })))
		.sort((a, b) => (a.element.key > b.element.key ? +1 : -1));

	const elements = entries.map(({ context, element }) => {
		const attributes = element.properties.map((property) => ({
			name: property.attribute,
			description: property.description,
			deprecated: toDeprecated(property.tags),
			required: property.required,
			default: property.initializer,
			value: {
				kind: 'plain',
				type: property.type
			}
		}));

		const events = element.events.map((event) => ({
			name: kebabCase(event.name),
			description: event.description,
			deprecated: toDeprecated(event.tags),
			type: event.detail
		}));

		const properties = [
			...element.properties.map((property) => ({
				name: property.name,
				description: property.description,
				deprecated: toDeprecated(property.tags),
				type: property.type,
				default: property.initializer,
				'read-only': property.readonly
			})),
			...element.methods.map((method) => ({
				name: method.name,
				description: method.description,
				deprecated: toDeprecated(method.tags),
				type: method.signature
			}))
		];

		const slots = getTags(element.node, 'slot', parseNamedTag).map((slot) => ({
			name: slot.name,
			description: slot.description
		}));

		return {
			name: element.key,
			description: getDescription(element.node),
			'doc-url': options.reference(context, element),
			deprecated: toDeprecated(getTags(element.node)),
			attributes,
			slots,
			js: { events, properties }
		};
	});

	const json: WebTypesJson = {
		$schema: 'https://json.schemastore.org/web-types',
		name: options.packageName,
		version: options.packageVersion,
		'js-types-syntax': 'typescript',
		'description-markup': 'markdown',
		'framework-config': {
			'enable-when': {
				'node-packages': [options.packageName]
			}
		},
		contributions: {
			html: {
				elements
			}
		}
	};

	const transformed = options.transform(json);

	fs.ensureDirSync(path.dirname(options.destination));

	fs.writeJSONSync(options.destination, transformed, { encoding: 'utf8', spaces: 2 });
};
