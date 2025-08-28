import type { HTMLPlusElement } from '@/types';

import { host } from './host';

export const shadowRoot = (target: HTMLElement | HTMLPlusElement): ShadowRoot | null => {
	return host(target)?.shadowRoot;
};
