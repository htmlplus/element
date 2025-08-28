import type { HTMLPlusElement } from '@/types';

import { host } from './host';

export const updateAttribute = (
	target: HTMLElement | HTMLPlusElement,
	key: string,
	value: unknown
): void => {
	const element = host(target);

	if (value === undefined || value === null || value === false) {
		return void element.removeAttribute(key);
	}

	element.setAttribute(key, value === true ? '' : String(value));
};
