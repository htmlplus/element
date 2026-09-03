import path from 'node:path';

import fs from 'fs-extra';
import MagicString from 'magic-string';

import { extract, getSourceFile, validate } from './core';
import {
	type AssetsOptions,
	type DocumentOptions,
	type StyleOptions,
	type TypesOptions,
	type VisualStudioCodeOptions,
	type WebTypesOptions,
	assets,
	document,
	property,
	style,
	tag,
	types,
	visualStudioCode,
	webTypes
} from './plugins';
import type { TransformerContext } from './transformer.types';

type PluginOptions<T> = T & {
	enable?: boolean;
};

export type TransformerOptions = {
	style?: PluginOptions<StyleOptions>;
	assets?: PluginOptions<AssetsOptions>;
	types?: PluginOptions<TypesOptions>;
	document?: PluginOptions<DocumentOptions>;
	visualStudioCode?: PluginOptions<VisualStudioCodeOptions>;
	webTypes?: PluginOptions<WebTypesOptions>;
};

const run = <A, O extends { enable?: boolean }>(
	plugin: (arg: A, options: Omit<O, 'enable'>) => void,
	arg: A,
	options?: O
) => {
	if (options?.enable === false) return;
	const { enable, ...rest } = options ?? ({} as O);
	plugin(arg, rest);
};

export const createTransformer = (options?: TransformerOptions) => {
	const contexts = new Map<string, TransformerContext>();

	const transform = (filePath: string) => {
		const fileContent = fs.readFileSync(filePath, 'utf8');

		const fileExtension = path.extname(filePath);

		const fileName = path.basename(filePath, fileExtension);

		const directoryPath = path.dirname(filePath);

		const directoryName = path.basename(directoryPath);

		const parsed = getSourceFile(filePath, fileContent);

		if (!validate(parsed)) return;

		const script = new MagicString(fileContent);

		const context: TransformerContext = {
			directoryName,
			directoryPath,

			fileContent,
			fileExtension,
			fileName,
			filePath,

			classes: [],
			elements: [],
			events: [],
			methods: [],
			properties: [],

			parsed,

			script
		};

		extract(context);

		tag(context);

		property(context);

		run(style, context, options?.style);

		contexts.set(filePath, context);

		return context.script.toString();
	};

	const finish = () => {
		const all = contexts.values().toArray();

		run(assets, all, options?.assets);

		run(types, all, options?.types);

		run(document, all, options?.document);

		run(visualStudioCode, all, options?.visualStudioCode);

		run(webTypes, all, options?.webTypes);
	};

	return { finish, transform };
};
