import path from 'node:path';

import { capitalCase } from 'change-case';
import fs from 'fs-extra';
import { glob } from 'glob';
import type ts from 'typescript';

import * as CONSTANTS from '@/constants';

import type { TransformerContext } from '../transformer.types';
import { getDescription, getTags, getTypeReference, hasTag, parseNamedTag } from '../utils';

export type DocumentJson = Record<string, unknown>;

export type DocumentOptions<T = DocumentJson> = {
	destination?: string;
	transform?: (json: DocumentJson) => T;
};

export const DOCUMENT_OPTIONS = {
	destination: path.join('dist', 'document.json'),
	transform: (json) => json
} satisfies DocumentOptions;

export const document = (contexts: TransformerContext[], userOptions?: DocumentOptions): void => {
	const options = { ...DOCUMENT_OPTIONS, ...userOptions };

	const entries = contexts
		.flatMap((context) => context.elements.map((element) => ({ context, element })))
		.sort((a, b) => (a.element.key > b.element.key ? +1 : -1));

	const elements = entries.map(({ context, element }) => {
		const lastModified = glob
			.sync('**/*.*', { cwd: context.directoryPath })
			.map((file) => fs.statSync(path.join(context.directoryPath, file)).mtime)
			.sort((a, b) => (a > b ? 1 : -1))
			.pop();

		const events = element.events.map((event) => ({
			name: event.name,
			description: event.description,
			cancelable: event.cancelable,
			detail: event.detail,
			detailReference: getTypeReference(
				(event.node.type as ts.TypeReferenceNode)?.typeArguments?.at(0)
			),
			tags: event.tags
		}));

		const methods = element.methods.map((method) => ({
			name: method.name,
			description: method.description,
			async: method.async,
			parameters: method.parameters.map((parameter) => ({
				name: parameter.name,
				description: parameter.description,
				required: parameter.required,
				type: parameter.type,
				typeReference: getTypeReference(parameter.node.type)
			})),
			signature: method.signature,
			returns: method.returns,
			tags: method.tags.filter((tag) => tag.name !== 'param')
		}));

		const properties = element.properties.map((property) => ({
			attribute: property.attribute,
			initializer: property.initializer,
			name: property.name,
			readonly: property.readonly,
			reflects: property.reflects,
			required: property.required,
			type: property.type,
			typeReference: getTypeReference(property.node.type),
			description: property.description,
			values: getTags(property.node, 'value', parseNamedTag),
			tags: property.tags.filter((tag) => tag.name !== 'value')
		}));

		const styles = (() => {
			if (!element.styleContent) return [];

			return element.styleContent
				.split(CONSTANTS.DECORATOR_CSS_VARIABLE)
				.slice(1)
				.map((section) => {
					const [first, second] = section.split(/\n/);
					return {
						description: first.replace('*/', '').trim(),
						initializer: second.split(':').slice(1).join(':').replace(';', '').trim(),
						name: second.split(':')[0].trim()
					};
				});
		})();

		return {
			key: element.key,
			title: capitalCase(element.key),
			description: getDescription(element.node),
			lastModified,
			development: hasTag(element.node, 'development'),
			thirdParty: hasTag(element.node, 'thirdParty'),
			stable: hasTag(element.node, 'stable'),
			subset: hasTag(element.node, 'subset'),
			dependencies: getTags(element.node, 'dependency').at(0)?.description,
			events,
			methods,
			properties,
			styles,
			parts: getTags(element.node, 'part', parseNamedTag),
			slots: getTags(element.node, 'slot', parseNamedTag),
			tags: getTags(element.node, [
				'!thirdParty',
				'!dependency',
				'!development',
				'!stable',
				'!subset',
				'!part',
				'!slot'
			])
		};
	});

	const json: DocumentJson = { elements };

	const transformed = options.transform(json);

	fs.ensureDirSync(path.dirname(options.destination));

	fs.writeJSONSync(options.destination, transformed, { encoding: 'utf8', spaces: 2 });
};
