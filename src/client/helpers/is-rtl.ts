import { direction } from './direction.js';

export const isRTL = (target): boolean => direction(target) == 'rtl';
