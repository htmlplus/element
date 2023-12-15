import { PlusElement } from '../../types';
import { host } from './host.js';

export const direction = (target: PlusElement): 'ltr' | 'rtl' => {
  return getComputedStyle(host(target)).getPropertyValue('direction') as any;
};
