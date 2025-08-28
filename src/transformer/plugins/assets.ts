import path from 'node:path';

import fs from 'fs-extra';
import { glob } from 'glob';

import type {
	InvertOptional,
	TransformerPlugin,
	TransformerPluginContext,
	TransformerPluginGlobal
} from '../transformer.types';

export const ASSETS_OPTIONS: InvertOptional<AssetsOptions> = {
	destination(context) {
		return path.join('dist', 'assets', context.fileName || '');
	},
	source(context) {
		return path.join(context.directoryPath || '', 'assets');
	},
	json(context) {
		return path.join('dist', 'assets', `${context.fileName || ''}.json`);
	}
};

export interface AssetsOptions {
	destination?: (context: TransformerPluginContext) => string;
	source?: (context: TransformerPluginContext) => string;
	json?: (context: TransformerPluginContext) => string;
}

export const assets = (userOptions?: AssetsOptions): TransformerPlugin => {
	const name = 'assets';

	const options = Object.assign({}, ASSETS_OPTIONS, userOptions) as Required<AssetsOptions>;

	const finish = (global: TransformerPluginGlobal) => {
		for (const context of global.contexts) {
			context.assetsDestination = options.destination(context);

			context.assetsSource = options.source(context);

			if (!context.assetsSource) continue;

			if (!fs.existsSync(context.assetsSource)) continue;

			fs.copySync(context.assetsSource, context.assetsDestination);

			const json = options.json?.(context);

			if (!json) continue;

			fs.ensureDirSync(path.dirname(json));

			const files = glob.sync('**/*.*', { cwd: context.assetsDestination });

			fs.writeJSONSync(json, files, { encoding: 'utf8', spaces: 2 });
		}
	};

	return { name, finish };
};
