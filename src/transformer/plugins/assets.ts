import path from 'node:path';

import fs from 'fs-extra';
import { glob } from 'glob';

export const ASSETS_OPTIONS = {
	destination(context) {
		return path.join('dist', 'assets', context.fileName);
	},
	json(context) {
		return path.join('dist', 'assets', `${context.fileName}.json`);
	},
	source(context) {
		return path.join(context.directoryPath, 'assets');
	}
} satisfies AssetsOptions;

export type AssetsOptions = {
	destination?: (context: TransformerContext, element: TransformerElement) => string;
	json?: (context: TransformerContext, element: TransformerElement) => string;
	source?: (context: TransformerContext, element: TransformerElement) => string;
};

import type { TransformerContext, TransformerElement } from '../transformer.types';

export const assets = (contexts: TransformerContext[], userOptions?: AssetsOptions): void => {
	const options = { ...ASSETS_OPTIONS, ...userOptions };

	for (const context of contexts) {
		for (const element of context.elements) {
			element.assetsDestination = options.destination(context, element);

			element.assetsSource = options.source(context, element);

			if (!element.assetsSource) continue;

			if (!fs.existsSync(element.assetsSource)) continue;

			fs.copySync(element.assetsSource, element.assetsDestination);

			const json = options.json(context, element);

			if (!json) continue;

			fs.ensureDirSync(path.dirname(json));

			const files = glob.sync('**/*.*', { cwd: element.assetsDestination });

			fs.writeJSONSync(json, files, { encoding: 'utf8', spaces: 2 });
		}
	}
};
