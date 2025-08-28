type Types = 'array' | 'bigint' | 'boolean' | 'function' | 'number' | 'object' | 'string';

export const typeOf = (input: unknown): Types => {
	return Object.prototype.toString
		.call(input)
		.replace(/\[|\]|object| /g, '')
		.toLowerCase() as Types;
};
