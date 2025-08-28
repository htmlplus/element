import * as CONSTANTS from '@/constants';
import { type TransformerPlugin, transformer } from '@/transformer';

export const rollup = (...plugins: TransformerPlugin[]) => {
	const { start, run, finish } = transformer(...plugins);

	return {
		name: CONSTANTS.KEY,

		async buildStart() {
			await start();
		},

		async load(id: string) {
			if (!id.endsWith('.tsx')) return;

			const { script, skipped } = await run(id);

			if (skipped) return;

			return script;
		},

		async buildEnd(error?: Error) {
			if (error) throw error;
			await finish();
		}
	};
};
