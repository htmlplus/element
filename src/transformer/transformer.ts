import {
	type AssetsOptions,
	type DocumentOptions,
	type StyleOptions,
	type VisualStudioCodeOptions,
	type WebTypesOptions,
	assets,
	customElement,
	document,
	extract,
	parse,
	read,
	style,
	validate,
	visualStudioCode,
	webTypes
} from './plugins';
import type { TransformerPluginContext } from './transformer.types';

export type TransformerOptions = {
	style?: StyleOptions;
	assets?: AssetsOptions;
	document?: DocumentOptions;
	visualStudioCode?: VisualStudioCodeOptions;
	webTypes?: WebTypesOptions;
};

export const transformer = (options?: TransformerOptions) => {
	const contexts = new Map<string, TransformerPluginContext>();

	const transform = (id: string) => {
		let context: TransformerPluginContext = {
			filePath: id
		};

		context = read(context) || context;
		context = parse(context) || context;
		context = validate(context) || context;
		context = extract(context) || context;
		context = style(context, options?.style) || context;
		context = customElement(context) || context;

		contexts.set(id, context);

		return context;
	};

	const finish = () => {
		const all = contexts.values().toArray();

		if (options?.assets) {
			for (const context of all) {
				assets(context, options.assets);
			}
		}

		if (options?.document) {
			document(all, options.document);
		}

		if (options?.visualStudioCode) {
			visualStudioCode(all, options.visualStudioCode);
		}

		if (options?.webTypes) {
			webTypes(all, options.webTypes);
		}
	};

	return { transform, finish };
};
