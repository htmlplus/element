import { PlusElement } from '../../types';
import { host } from './host.js';

export type Direction = 'ltr' | 'rtl';

export const direction = (target: PlusElement): Direction => {
  return getComputedStyle(host(target)).getPropertyValue('direction').toLowerCase() as Direction;
};
