import { direction } from './direction.js';
export const isRTL = (target) => direction(target) == 'rtl';
