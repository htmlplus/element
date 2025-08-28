import * as CONSTANTS from '@/constants';
import type { HTMLPlusElement } from '@/types';

export const getTag = (target: HTMLPlusElement): string | undefined => {
	return target.constructor[CONSTANTS.STATIC_TAG] ?? target[CONSTANTS.STATIC_TAG];
};
