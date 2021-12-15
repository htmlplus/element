import { direction } from './direction.js';

export const isLTR = (target) => direction(target) == 'ltr';