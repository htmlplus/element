import * as CONSTANTS from '@/constants';

import { typeOf } from './typeOf';

export const toProperty = (input: unknown, type?: unknown): unknown => {
	if (type === undefined) return input;

	const string = `${input}`;

	const typeNumber = typeof type === 'number' ? type : 0;

	if (CONSTANTS.TYPE_BOOLEAN & typeNumber || type === Boolean) {
		if (string === '') return true;
		if (string === 'true') return true;
		if (string === 'false') return false;
	}

	if (CONSTANTS.TYPE_NUMBER & typeNumber || type === Number) {
		if (string !== '' && !Number.isNaN(Number(input))) {
			return parseFloat(string);
		}
	}

	if (CONSTANTS.TYPE_NULL & typeNumber || type === null) {
		if (string === 'null') {
			return null;
		}
	}

	if (CONSTANTS.TYPE_DATE & typeNumber || type === Date) {
		const value = new Date(string);
		if (!Number.isNaN(value.getTime())) {
			return value;
		}
	}

	if (CONSTANTS.TYPE_ARRAY & typeNumber || type === Array) {
		try {
			const value = JSON.parse(string);
			if (typeOf(value) === 'array') return value;
		} catch {}
	}

	if (CONSTANTS.TYPE_OBJECT & typeNumber || type === Object) {
		try {
			const value = JSON.parse(string);
			if (typeOf(value) === 'object') {
				return value;
			}
		} catch {}
	}

	if (CONSTANTS.TYPE_UNDEFINED & typeNumber) {
		if (string === 'undefined') {
			return undefined;
		}
	}

	if (CONSTANTS.TYPE_STRING & typeNumber || type === String) {
		return string;
	}

	// TODO: BigInt, Enum, Function

	try {
		// TODO
		return JSON.parse(string);
	} catch {
		return input;
	}
};
