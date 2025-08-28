export const toBoolean = (input: unknown): boolean => {
	return ![undefined, null, false, 'false'].includes(input as undefined | null | boolean | string);
};
