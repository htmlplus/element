import { PlusElement } from '../../types/index.js';
import { direction } from './direction.js';

export const isRTL = (target: PlusElement): boolean => direction(target) == 'rtl';
