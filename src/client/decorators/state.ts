import type { HTMLPlusElement } from '@/types';

import { defineProperty, requestUpdate } from '../utils';

/**
 * Applying this decorator to any `class property` will trigger the
 * element to re-render upon the desired property changes.
 */
export function State() {
	return (target: HTMLPlusElement, key: PropertyKey) => {
		const KEY = Symbol();

		const name = String(key);

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

				requestUpdate(this, name, previous);
			}
		});
	};
}
