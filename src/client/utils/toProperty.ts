import * as CONSTANTS from '@/constants';

const TYPES = [
	{
		flag: CONSTANTS.TYPE_NULL,
		check: (value) => {
			return value === null;
		},
		parse: (value: string) => {
			if (value === 'null') {
				return {
					value: null
				};
			}
		}
	},
	{
		flag: CONSTANTS.TYPE_UNDEFINED,
		check: (value) => {
			return value === undefined;
		},
		parse: (value: string) => {
			if (value === 'undefined') {
				return {
					value: undefined
				};
			}
		}
	},
	{
		flag: CONSTANTS.TYPE_BOOLEAN,
		check: (value) => {
			return typeof value === 'boolean';
		},
		parse: (value: string) => {
			if (value === '') {
				return {
					value: true
				};
			}
		}
	},
	{
		flag: CONSTANTS.TYPE_BIGINT,
		check: (value) => {
			return typeof value === 'bigint';
		},
		parse: (value: string) => {
			if (/^\d+n$/.test(value)) {
				return {
					value: BigInt(value.slice(0, -1))
				};
			}
		}
	},
	{
		flag: CONSTANTS.TYPE_NUMBER,
		check: (value) => {
			return typeof value === 'number' && !Number.isNaN(value);
		},
		parse: (value: string) => {
			if (value !== '' && !Number.isNaN(Number(value))) {
				return {
					value: parseFloat(value)
				};
			}
		}
	},
	{
		flag: CONSTANTS.TYPE_DATE,
		check: (value) => {
			return value instanceof Date && !Number.isNaN(value.getTime());
		},
		parse: (value: string) => {
			const date = new Date(value);
			if (!Number.isNaN(date.getTime())) {
				return {
					value: date
				};
			}
		}
	},
	{
		flag: CONSTANTS.TYPE_ARRAY,
		check: (value) => {
			return Array.isArray(value);
		},
		parse: (value: string) => {
			if (value.startsWith('[') && value.endsWith(']')) {
				try {
					const parsed = JSON.parse(value);
					if (Array.isArray(parsed)) {
						return {
							value: parsed
						};
					}
				} catch {}
			}
		}
	},
	{
		flag: CONSTANTS.TYPE_OBJECT,
		check: (value) => {
			return typeof value === 'object' && value !== null && !Array.isArray(value);
		},
		parse: (value: string) => {
			if (value.startsWith('{') && value.endsWith('}')) {
				try {
					const parsed = JSON.parse(value);
					if (!Array.isArray(parsed)) {
						return {
							value: parsed
						};
					}
				} catch {}
			}
		}
	},
	{
		flag: CONSTANTS.TYPE_FUNCTION,
		check: (value) => {
			return typeof value === 'function';
		},
		parse: () => {
			throw new Error('TODO');
		}
	},
	{
		flag: CONSTANTS.TYPE_ENUM,
		check: (value) => {
			return typeof value === 'string';
		},
		parse: (value: string) => {
			return {
				value: value
			};
		}
	},
	{
		flag: CONSTANTS.TYPE_STRING,
		check: (value) => {
			return typeof value === 'string';
		},
		parse: (value: string) => {
			return {
				value: value
			};
		}
	},
	// TODO
	{
		flag: CONSTANTS.TYPE_ANY,
		check: () => {
			return true;
		},
		parse: (value: string) => {
			try {
				return JSON.parse(value);
			} catch {
				return {
					value: value
				};
			}
		}
	}
];

export const ensureIsType = (value: unknown, type: number = 0) => {
	for (const handler of TYPES) {
		if (!(type & handler.flag)) continue;

		if (!handler.check(value)) continue;

		return;
	}

	throw new Error(`Invalid value "${value}" for allowed types.`);
};

export const toProperty = (value: string, type: number = 0): unknown => {
	for (const handler of TYPES) {
		if (!(type & handler.flag)) continue;

		const result = handler.parse(value);

		if (result === undefined) continue;

		return result.value;
	}

	throw new Error(`Cannot parse value "${value}" for allowed types.`);
};
