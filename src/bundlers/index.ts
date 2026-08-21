import { createUnplugin } from 'unplugin';

import * as CONSTANTS from '@/constants';
import { type TransformerOptions, transformer } from '@/transformer';

const plugin = createUnplugin<TransformerOptions | undefined>((options) => {
	const { transform, finish } = transformer(options);

	return {
		name: CONSTANTS.KEY,

		load(id: string) {
			if (!id.endsWith('.tsx')) return;

			const context = transform(id);

			if (context.skipped) return;

			return context.script;
		},

		writeBundle() {
			finish();
		}
	};
});

export const { rollup, vite } = plugin;
