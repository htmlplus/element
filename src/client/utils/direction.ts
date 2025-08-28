import type { HTMLPlusElement } from '@/types';

import { host } from './host';

type Direction = 'ltr' | 'rtl';

/**
 * Indicates whether the [Direction](https://mdn.io/css-direction)
 * of the element is `Right-To-Left` or `Left-To-Right`.
 */
export const direction = (target: HTMLElement | HTMLPlusElement): Direction => {
	return getComputedStyle(host(target)).getPropertyValue('direction') as Direction;
};
