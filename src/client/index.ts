export * from './decorators';
export {
	type Config,
	type ConfigOptions,
	classes,
	direction,
	dispatch,
	getConfig,
	getConfigCreator,
	host,
	isCSSColor,
	isCSSUnit,
	isRTL,
	off,
	on,
	query,
	queryAll,
	setConfig,
	setConfigCreator,
	slots,
	toUnit
} from './utils';

type Listed<T> = T extends string | number ? (T extends `${infer _}` | number ? T : never) : never;

type Unlisted<T> = Exclude<T, Listed<T>>;

export type OverridableValue<Base, Overrides = unknown> =
	| { [K in keyof Overrides]: Overrides[K] extends true ? K : never }[keyof Overrides]
	| Exclude<
			Listed<Base>,
			// biome-ignore lint: TODO
			keyof { [K in keyof Overrides as Overrides[K] extends false ? K : never]: any }
	  >
	| (Overrides extends { UNLISTED: false } ? never : Unlisted<Base>);
