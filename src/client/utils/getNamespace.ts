import type { HTMLPlusElement } from '@/types';

import { getTag } from './getTag';

export const getNamespace = (target: HTMLPlusElement): string | undefined => {
	return getTag(target)?.split('-')?.at(0);
};
