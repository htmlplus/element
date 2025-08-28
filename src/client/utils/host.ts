import * as CONSTANTS from '@/constants';
import type { HTMLPlusElement } from '@/types';

/**
 * Indicates the host of the element.
 */
export const host = (target: HTMLElement | HTMLPlusElement): HTMLElement => {
	try {
		return target[CONSTANTS.API_HOST]();
	} catch {
		return target as HTMLElement;
	}
};
