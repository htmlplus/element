import path from 'node:path';

import fs from 'fs-extra';
import { glob } from 'glob';

import type { TransformerPlugin, TransformerPluginContext } from '../transformer.types';

export const ASSETS_OPTIONS = {
	destination(context) {
		return path.join('dist', 'assets', context.fileName || '');
	},
	source(context) {
		return path.join(context.directoryPath || '', 'assets');
	},
	json(context) {
		return path.join('dist', 'assets', `${context.fileName || ''}.json`);
	}
} satisfies AssetsOptions;

export interface AssetsOptions {
	destination?: (context: TransformerPluginContext) => string;
	source?: (context: TransformerPluginContext) => string;
	json?: (context: TransformerPluginContext) => string;
}

export const assets: TransformerPlugin<AssetsOptions | undefined> = (context, userOptions) => {
	const options = { ...ASSETS_OPTIONS, ...userOptions };

	context.assetsDestination = options.destination(context);

	context.assetsSource = options.source(context);

	if (!context.assetsSource) return;

	if (!fs.existsSync(context.assetsSource)) return;

	fs.copySync(context.assetsSource, context.assetsDestination);

	const json = options.json?.(context);

	if (!json) return;

	fs.ensureDirSync(path.dirname(json));

	const files = glob.sync('**/*.*', { cwd: context.assetsDestination });

	fs.writeJSONSync(json, files, { encoding: 'utf8', spaces: 2 });
};
