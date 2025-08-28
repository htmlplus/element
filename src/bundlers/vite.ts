import path from 'node:path';

import * as CONSTANTS from '@/constants';
import { type TransformerPlugin, transformer } from '@/transformer';

export const vite = (...plugins: TransformerPlugin[]) => {
	const { global, start, run, finish } = transformer(...plugins);

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

		async writeBundle(_options, bundles) {
			// TODO
			global.contexts.forEach((context) => {
				Object.keys(bundles).forEach((key) => {
					const { facadeModuleId, modules } = bundles[key];
					if (!facadeModuleId?.startsWith(context.filePath)) return;
					const id = Object.keys(modules).find((key) => {
						return key.startsWith(context.stylePath || '');
					});
					if (!id) return;
					context.styleContentTransformed = modules[id].code;
				});
			});

			await finish();
		}
	};
};
