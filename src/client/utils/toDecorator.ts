import type { HTMLPlusElement } from '@/types';

import { defineProperty } from './defineProperty.js';

export function toDecorator<Target extends HTMLPlusElement, Args extends unknown[], Result>(
	util: (target: Target, ...args: Args) => Result,
	...args: Args
) {
	return (target: HTMLPlusElement, key: PropertyKey) => {
		defineProperty(target, key, {
			get() {
				return util(this, ...args);
			}
		});
	};
}
