import type { HTMLPlusElement } from '@/types';

import { direction } from './direction';

/**
 * Indicates whether the direction of the element is `Right-To-Left` or not.
 */
export const isRTL = (target: HTMLPlusElement): boolean => {
	return direction(target) === 'rtl';
};
