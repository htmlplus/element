import type { TransformerContext } from '../transformer.types';

export const README_OPTIONS = {} satisfies ReadmeOptions;

export type ReadmeOptions = {
	unknown?: unknown;
};

export const readme = (_context: TransformerContext[], userOptions?: ReadmeOptions): void => {
	const _options = { ...README_OPTIONS, ...userOptions };
};
