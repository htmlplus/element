import { merge } from './merge';

// biome-ignore lint: TODO
export interface HTMLPlusElements {}

export type BreakpointConfig = {
	type: 'container' | 'media';
	min?: number;
	max?: number;
};

/**
 * TODO
 */
export type Config<Namespace extends string, Breakpoints extends string> = {
	breakpoints?: {
		[key in Breakpoints]: BreakpointConfig;
	};

	event?: {
		resolver?: (parameters: unknown) => CustomEvent | undefined;
	};

	assets?: {
		[key: string]: unknown;
	};

	elements?: {
		[K in keyof HTMLPlusElements as K extends `${Namespace}-${string}` ? K : never]?: {
			properties?: {
				[Prop in keyof HTMLPlusElements[K]['properties']]?: {
					default?: HTMLPlusElements[K]['properties'][Prop];
				};
			};
			variants?: {
				[M in HTMLPlusElements[K]['properties']['variant']]?: {
					properties?: Partial<HTMLPlusElements[K]['properties']>;
				};
			};
		};
	};
};

/**
 * TODO
 */
export type ConfigOptions = {
	/**
	 * TODO
	 */
	force?: boolean;
	/**
	 * TODO
	 */
	override?: boolean;
};

/**
 * TODO
 */
export const getConfig = <N extends string, B extends string>(namespace: N): Config<N, B> => {
	return globalThis[`$htmlplus:${namespace as string}$`] || {};
};

/**
 * TODO
 */
export const getConfigCreator =
	<N extends string, B extends string>(namespace: N) =>
	() => {
		return getConfig<N, B>(namespace);
	};

/**
 * TODO
 */
export const setConfig = <N extends string, B extends string>(
	namespace: N,
	config: Config<N, B>,
	options?: ConfigOptions
): void => {
	const previous = options?.override ? {} : globalThis[`$htmlplus:${namespace as string}$`];

	const next = merge({}, previous, config);

	globalThis[`$htmlplus:${namespace as string}$`] = next;
};

/**
 * TODO
 */
export const setConfigCreator =
	<N extends string, B extends string>(namespace: N) =>
	(config: Config<N, B>, options?: ConfigOptions) => {
		return setConfig<N, B>(namespace, config, options);
	};
