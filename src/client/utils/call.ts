export const call = (target: object, key: PropertyKey, ...args: unknown[]): unknown => {
	return target[key]?.apply(target, args);
};
