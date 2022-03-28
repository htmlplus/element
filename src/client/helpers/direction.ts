import { PlusElement } from '../../types/index.js';
import { host } from '../utils/index.js';

export type Direction = 'ltr' | 'rtl';

export const direction = (target: PlusElement): Direction => {
  return getComputedStyle(host(target)).getPropertyValue('direction').toLowerCase() as Direction;
};
