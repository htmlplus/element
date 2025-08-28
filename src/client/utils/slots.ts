import type { HTMLPlusElement } from '@/types';

import { host } from './host';

type Slots = {
	[key: string]: boolean;
};

/**
 * Returns the slots name.
 */
export const slots = (target: HTMLElement | HTMLPlusElement): Slots => {
	const element = host(target);

	const slots: Slots = {};

	const children = Array.from(element.childNodes);

	for (const child of children) {
		if (child.nodeType === Node.COMMENT_NODE) continue;

		let name: string | undefined;

		if (child instanceof HTMLElement) {
			name = child.slot || 'default';
		} else if (child.nodeType === Node.TEXT_NODE && child.nodeValue?.trim()) {
			name = 'default';
		}

		if (!name) continue;

		slots[name] = true;
	}

	return slots;
};
