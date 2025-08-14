import { HTMLPlusElement } from '../../types/index.js';
import { getTag } from './getTag.js';

export const getNamespace = (target: HTMLPlusElement): string | undefined => {
  return getTag(target)?.split('-')?.at(0);
};
