import * as CONSTANTS from '@/constants';
import type { HTMLPlusElement } from '@/types';

import { shadowRoot, wrapMethod } from '../utils';

// TODO: check the logic

export function Style() {
	return (target: HTMLPlusElement, key: PropertyKey) => {
		const LAST = Symbol();

		const SHEET = Symbol();

		wrapMethod('before', target, CONSTANTS.LIFECYCLE_UPDATED, function () {
			let sheet = this[SHEET];

			let value = this[key];

			const update = (value?: Promise<unknown>) => (result: unknown) => {
				if (value && value !== this[LAST]) return;

				sheet.replaceSync(toCssString(result));

				this[LAST] = undefined;
			};

			if (!sheet) {
				sheet = new CSSStyleSheet();

				this[SHEET] = sheet;

				shadowRoot(this)?.adoptedStyleSheets.push(sheet);
			}

			if (typeof value === 'function') {
				value = value.call(this);
			}

			if (value instanceof Promise) {
				// biome-ignore lint: TODO
				value.then(update((this[LAST] = value))).catch((error) => {
					throw new Error('TODO', { cause: error });
				});
			} else {
				update()(value);
			}
		});
	};
}

const toCssString = (input: unknown, parent?: string): string => {
	if (typeof input === 'string') {
		return input.trim();
	}

	if (Array.isArray(input)) {
		return input
			.map((item) => toCssString(item, parent))
			.filter(Boolean)
			.join('\n');
	}

	if (input === null) return '';

	if (typeof input !== 'object') return '';

	let result = '';

	for (const key of Object.keys(input)) {
		const value = input[key];

		const ignore = [null, undefined, false].includes(value);

		if (ignore) continue;

		const cssKey = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

		if (typeof value === 'object') {
			result += `${cssKey} {${toCssString(value, cssKey)}}`;
		} else {
			result += `${cssKey}: ${value};`;
		}
	}

	return parent ? result : `:host {${result}}`;
};
