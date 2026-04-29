export * from './decorators';
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
	slots
} from './utils';

export type OverridableValue<T> = T;
