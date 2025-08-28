import type { HTMLPlusElement } from '@/types';

import { shadowRoot } from './shadowRoot';

/**
 * Selects the first element in the shadow dom that matches a specified CSS selector.
 */
export function query(target: HTMLPlusElement, selectors: string) {
	return shadowRoot(target)?.querySelector(selectors);
}
