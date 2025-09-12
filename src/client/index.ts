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
	isRTL,
	off,
	on,
	query,
	queryAll,
	setConfig,
	setConfigCreator,
	slots,
	toCSSColor,
	toCSSUnit,
	toUnit
} from './utils';

export type OverridableValue<Base, Overrides = unknown> =
	| Exclude<
			Base,
			{ [K in keyof Overrides]: Overrides[K] extends false ? K : never }[keyof Overrides]
	  >
	| { [K in keyof Overrides]: Overrides[K] extends true ? K : never }[keyof Overrides];
