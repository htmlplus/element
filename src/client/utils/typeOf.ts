type Types =
	| 'array'
	| 'bigint'
	| 'boolean'
	| 'function'
	| 'null'
	| 'number'
	| 'object'
	| 'string'
	| 'symbol'
	| 'undefined';

export const typeOf = (input: unknown): Types => {
	return Object.prototype.toString
		.call(input)
		.replace(/\[|\]|object| /g, '')
		.toLowerCase() as Types;
};
