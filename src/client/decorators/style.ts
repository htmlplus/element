import * as CONSTANTS from '@/constants';
import type { HTMLPlusElement } from '@/types';

import { defineProperty, shadowRoot, wrapMethod } from '../utils';

export function Style() {
	return (target: HTMLPlusElement, key: PropertyKey) => {
		const KEY = Symbol();
		const SHEET = Symbol();
		const LAST = Symbol();

		wrapMethod('before', target, CONSTANTS.LIFECYCLE_UPDATED, function () {
			applyStyle(this, this[key]);
		});

		defineProperty(target, key, {
			enumerable: true,
			configurable: true,
			get() {
				return this[KEY];
			},
			set(next) {
				const previous = this[KEY];

				if (next === previous) return;

				this[KEY] = next;

				applyStyle(this, next);
			}
		});

		const applyStyle = (instance: HTMLPlusElement, input: unknown) => {
			const adoptedStyleSheets = shadowRoot(instance)?.adoptedStyleSheets;

			if (!adoptedStyleSheets) return;

			let sheet = instance[SHEET];

			if (!sheet) {
				sheet = new CSSStyleSheet();

				instance[SHEET] = sheet;

				adoptedStyleSheets.push(sheet);
			}

			const update = (value?: Promise<unknown>) => (result: unknown) => {
				if (value && value !== instance[LAST]) return;

				sheet.replaceSync(toCssString(result));

				instance[LAST] = undefined;
			};

			const value = typeof input === 'function' ? input.call(instance) : input;

			if (value instanceof Promise) {
				instance[LAST] = value;
				value.then(update(value)).catch((error) => {
					throw new Error('Style promise failed', { cause: error });
				});
			} else {
				update()(value);
			}
		};
	};
}

const toCssString = (input: unknown): string => {
	if (typeof input === 'string') {
		return input.trim();
	}

	if (Array.isArray(input)) {
		return input
			.map((item) => toCssString(item))
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
			result += `${cssKey} {${toCssString(value)}}`;
		} else {
			result += `${cssKey}: ${value};`;
		}
	}

	return result;
};
