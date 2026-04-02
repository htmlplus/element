export * from './decorators';
export * from './internal';
export {
	type Config,
	type ConfigOptions,
	type HTMLPlusElements,
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

export type OverridableValue<T> = T;
