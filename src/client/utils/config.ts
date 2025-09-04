import { merge } from './merge';

const makeKey = (namespace: string) => {
	return `$htmlplus:${namespace}$`;
};

/**
 * Main configuration object for the HTMLPlus system.
 *
 * @template T - Shape of user-defined elements.
 */
export type Config<Prefix extends string = string> = {
	assets?: {
		[key: string]: unknown;
	};
	breakpoints?: {
		[key: string]: {
			type: 'container' | 'media';
			min?: number;
			max?: number;
		};
	};
	elements?: {
		[K in keyof ElementsForNamespace<Prefix>]?: {
			properties?: {
				[P in keyof ElementsForNamespace<Prefix>[K]['properties']]?: {
					default?: ElementsForNamespace<Prefix>[K]['properties'][P];
				};
			};
			variants?: {
				[key: string]: {
					properties?: {
						[P in keyof ElementsForNamespace<Prefix>[K]['properties']]?: ElementsForNamespace<Prefix>[K]['properties'][P];
					};
				};
			};
		};
	};
	event?: {
		resolver?: (parameters: unknown) => CustomEvent | undefined;
	};
};

/**
 * Options for how configuration should be applied.
 */
export type ConfigOptions = {
	/**
	 * TODO
	 */
	force?: boolean;

	/**
	 * If true, previous config is ignored and replaced entirely.
	 */
	override?: boolean;
};

/**
 * Retrieve configuration for a given namespace.
 */
export const getConfig = <Prefix extends string>(namespace: Prefix): Config<Prefix> => {
	return (globalThis[makeKey(namespace)] || {}) as Config<Prefix>;
};

/**
 * Factory function that returns a `getConfig` bound to a namespace.
 */
export const getConfigCreator = <Prefix extends string>(namespace: Prefix) => {
	return () => {
		return getConfig<Prefix>(namespace);
	};
};

/**
 * Update or set configuration for a given namespace.
 */
export const setConfig = <Prefix extends string>(
	namespace: Prefix,
	config: Config<Prefix>,
	options?: ConfigOptions
): void => {
	const previous = options?.override ? {} : globalThis[makeKey(namespace)];

	const next = merge({}, previous, config);

	globalThis[makeKey(namespace)] = next;
};

/**
 * Factory function that returns a `setConfig` bound to a namespace.
 */
export const setConfigCreator = <Prefix extends string>(namespace: Prefix) => {
	return (config: Config<Prefix>, options?: ConfigOptions) => {
		return setConfig(namespace, config, options);
	};
};

export type ElementsForNamespace<Prefix extends string> = NamespaceElementsRegistry[Prefix &
	keyof NamespaceElementsRegistry];
// biome-ignore lint: TODO
export interface NamespaceElementsRegistry {} // shared mapping interface
