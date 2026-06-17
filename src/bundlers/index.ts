import path from 'node:path';

import { createUnplugin } from 'unplugin';

import * as CONSTANTS from '@/constants';
import { type TransformerPlugin, transformer } from '@/transformer';

export type PluginOptions = TransformerPlugin[];

const plugin = createUnplugin<PluginOptions>((options) => {
	const { start, run, finish } = transformer(...options);

	return {
		name: CONSTANTS.KEY,

		async buildStart() {
			await start();
		},

		async load(id: string) {
			if (!id.endsWith('.tsx')) return;

			const context = await run(id);

			if (context.skipped) return;

			if (context.script && context.stylePath) {
				context.script = context.script.replace(path.basename(context.stylePath), `$&?inline`);
			}

			return context.script;
		},

		async writeBundle() {
			await finish();
		}
	};
});

export const { rollup, vite } = plugin;
