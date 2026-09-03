import { createUnplugin } from 'unplugin';

import * as CONSTANTS from '@/constants';
import { type TransformerOptions, createTransformer } from '@/transformer';

const plugin = createUnplugin<TransformerOptions | undefined>((options) => {
	const { finish, transform } = createTransformer(options);

	const closeBundle = () => {
		finish();
	};

	return {
		name: CONSTANTS.KEY,

		load(id: string) {
			if (!id.endsWith('.tsx') && !id.endsWith('.ts')) return;

			const script = transform(id);

			return script;
		},

		rollup: { closeBundle },
		vite: { closeBundle }
	};
});

export const { rollup, vite } = plugin;
