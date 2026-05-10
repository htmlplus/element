import * as CONSTANTS from '@/constants';

const TYPES = [
	{
		flag: CONSTANTS.TYPE_NULL,
		check: (value) => {
			return value === null;
		},
		parse: (value) => {
			if (value === 'null') {
				return null;
			}
		}
	},
	{
		flag: CONSTANTS.TYPE_UNDEFINED,
		check: (value) => {
			return value === undefined;
		},
		parse: (value) => {
			if (value === 'undefined') {
				return undefined;
			}
		}
	},
	{
		flag: CONSTANTS.TYPE_BOOLEAN,
		check: (value) => {
			return typeof value === 'boolean';
		},
		parse: (value) => {
			if (value === '') return true;
			if (value === 'true') return true;
			if (value === 'false') return false;
		}
	},
	{
		flag: CONSTANTS.TYPE_BIGINT,
		check: (value) => {
			return typeof value === 'bigint';
		},
		parse: (value) => {
			if (/^\d+n$/.test(value)) {
				return BigInt(value.slice(0, -1));
			}
		}
	},
	{
		flag: CONSTANTS.TYPE_NUMBER,
		check: (value) => {
			return typeof value === 'number' && !Number.isNaN(value);
		},
		parse: (value) => {
			if (value !== '' && !Number.isNaN(Number(value))) {
				return parseFloat(value);
			}
		}
	},
	{
		flag: CONSTANTS.TYPE_DATE,
		check: (value) => {
			return value instanceof Date && !Number.isNaN(value.getTime());
		},
		parse: (value) => {
			const date = new Date(value);
			if (!Number.isNaN(date.getTime())) {
				return date;
			}
		}
	},
	{
		flag: CONSTANTS.TYPE_ARRAY,
		check: (value) => {
			return Array.isArray(value);
		},
		parse: (value) => {
			if (value.startsWith('[') && value.endsWith(']')) {
				try {
					const parsed = JSON.parse(value);
					if (Array.isArray(parsed)) return parsed;
				} catch {}
			}
		}
	},
	{
		flag: CONSTANTS.TYPE_OBJECT,
		check: (value) => {
			return typeof value === 'object' && value !== null && !Array.isArray(value);
		},
		parse: (value) => {
			if (value.startsWith('{') && value.endsWith('}')) {
				try {
					const parsed = JSON.parse(value);
					if (!Array.isArray(parsed)) return parsed;
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
		parse: (value) => {
			return value;
		}
	},
	{
		flag: CONSTANTS.TYPE_STRING,
		check: (value) => {
			return typeof value === 'string';
		},
		parse: (value) => {
			return value;
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

export const toProperty = (value: string | null, type: number = 0): unknown => {
	if (value === null) return null;

	for (const handler of TYPES) {
		if (!(type & handler.flag)) continue;

		const result = handler.parse(value);

		if (result === undefined) continue;

		return result;
	}

	throw new Error(`Cannot parse value "${value}" for allowed types.`);
};
