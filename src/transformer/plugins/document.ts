// biome-ignore-all lint: TODO

import path from 'node:path';

import { capitalCase, kebabCase } from 'change-case';
import fs from 'fs-extra';
import { glob } from 'glob';

import * as CONSTANTS from '@/constants';
import {
	extractAttribute,
	extractFromComment,
	getInitializer,
	getTypeReference,
	print
} from '@/transformer/utils';

import type { TransformerPluginBatch } from '../transformer.types';

type Json = {
	elements: {
		title: string;
	}[];
};

export const DOCUMENT_OPTIONS = {
	destination: path.join('dist', 'document.json'),
	transformer: (json) => json
} satisfies DocumentOptions;

export interface DocumentOptions {
	destination?: string;
	transformer?: (json: Json) => Json;
}

export const document: TransformerPluginBatch<DocumentOptions | undefined> = (
	contexts,
	userOptions
) => {
	const options = { ...DOCUMENT_OPTIONS, ...userOptions };

	const json: Json = {
		elements: []
	};

	for (const context of contexts) {
		const events = context.classEvents!.map((event) => {
			const cancelable = (() => {
				if (!event.decorators) return false;

				try {
					for (const decorator of event.decorators) {
						for (const argument of decorator.expression['arguments']) {
							for (const property of argument.properties) {
								if (property.key.name !== 'cancelable') continue;
								if (property.value.type !== 'BooleanLiteral') continue;
								if (!property.value.value) continue;
								return true;
							}
						}
					}
				} catch {}

				return false;
			})();

			const detail = print(event.typeAnnotation?.['typeAnnotation']);

			const detailReference = getTypeReference(
				context.fileAST!,
				event.typeAnnotation?.['typeAnnotation'].typeParameters.params[0]
			);

			const name = event.key['name'];

			return {
				cancelable,
				detail,
				detailReference,
				name,
				...extractFromComment(event)
			};
		});

		const lastModified = glob
			.sync('**/*.*', { cwd: context.directoryPath })
			.map((file) => fs.statSync(path.join(context.directoryPath!, file)).mtime)
			.sort((a, b) => (a > b ? 1 : -1))
			.pop();

		const methods = context.classMethods!.map((method) => {
			const async = method.async;

			const name = method.key['name'];

			const comments = extractFromComment(method);

			// TODO
			const parameters = method.params.map((param) => ({
				description: (comments.params as any)?.find((item) => item.name === param['name'])
					?.description,
				required: !param['optional'],
				name: param['name'],
				type: print(param?.['typeAnnotation']?.typeAnnotation) || undefined,
				typeReference: getTypeReference(context.fileAST!, param?.['typeAnnotation']?.typeAnnotation)
			}));

			// TODO
			delete comments.params;

			const returns = print(method.returnType?.['typeAnnotation']) || 'void';

			const returnsReference = getTypeReference(
				context.fileAST!,
				method.returnType?.['typeAnnotation']
			);

			const signature = [
				method.key['name'],
				'(',
				parameters
					.map((parameter) => {
						let string = '';
						string += parameter.name;
						string += parameter.required ? '' : '?';
						string += parameter.type ? ': ' : '';
						string += parameter.type ?? '';
						return string;
					})
					.join(', '),
				')',
				' => ',
				returns
			].join('');

			return {
				async,
				name,
				parameters,
				returnsReference,
				signature,
				...comments,
				returns,
				tags:
					returns !== 'void' && comments.returns
						? [
								{
									key: 'returns',
									value: `${comments.returns}`
								}
							]
						: []
			};
		});

		const properties = context.classProperties!.map((property) => {
			const attribute = extractAttribute(property) || kebabCase(property.key['name']);

			// TODO
			const initializer = getInitializer(property.value);

			const name = property.key['name'];

			const readonly = property['kind'] === 'get';

			// TODO
			const reflects = (() => {
				if (!property.decorators) return false;

				try {
					for (const decorator of property.decorators) {
						for (const argument of decorator.expression['arguments']) {
							for (const property of argument.properties) {
								if (property.key.name !== 'reflect') continue;
								if (property.value.type !== 'BooleanLiteral') continue;
								if (!property.value.value) continue;
								return true;
							}
						}
					}
				} catch {}

				return false;
			})();

			const required = 'optional' in property && !property.optional;

			// TODO
			const type = property['returnType']
				? print(property['returnType']?.['typeAnnotation'])
				: print(property.typeAnnotation?.['typeAnnotation']);

			const typeReference = getTypeReference(
				context.fileAST!,
				property.typeAnnotation?.['typeAnnotation']
			);

			return {
				attribute,
				initializer,
				name,
				readonly,
				reflects,
				required,
				type,
				typeReference,
				...extractFromComment(property)
			};
		});

		// TODO
		const styles = (() => {
			if (!context.styleContent) return [];
			return context.styleContent
				.split(CONSTANTS.DECORATOR_CSS_VARIABLE)
				.slice(1)
				.map((section) => {
					const [first, second] = section.split(/\n/);

					const description = first.replace('*/', '').trim();

					const name = second.split(':')[0].trim();

					const initializerDefault = second.split(':').slice(1).join(':').replace(';', '').trim();

					// TODO
					const initializerTransformed = context.styleContentTransformed
						?.split(name)
						?.at(1)
						?.split(':')
						?.filter((section) => !!section)
						?.at(0)
						?.split(/;|}/)
						?.at(0)
						?.trim();

					const initializer = initializerTransformed || initializerDefault;

					return {
						description,
						initializer,
						name
					};
				});
		})();

		const title = capitalCase(context.elementKey!);

		const element = {
			events,
			key: context.elementKey!,
			lastModified,
			methods,
			properties,
			styles,
			title,
			...extractFromComment(context.class!)
		};

		json.elements.push(element);
	}

	json.elements = json.elements.sort((a, b) => (a.title > b.title ? 1 : -1));

	const transformed = options.transformer?.(json) || json;

	const dirname = path.dirname(options.destination);

	fs.ensureDirSync(dirname);

	fs.writeJSONSync(options.destination, transformed, {
		encoding: 'utf8',
		spaces: 2
	});
};
