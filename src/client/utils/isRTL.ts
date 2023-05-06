import { PlusElement } from '../../types';
import { direction } from './direction.js';

export const isRTL = (target: PlusElement): boolean => direction(target) == 'rtl';
