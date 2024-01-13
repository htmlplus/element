import { direction } from './direction.js';
/**
 * Indicates whether the direction of the element is `Right-To-Left` or not.
 */
export const isRTL = (target) => direction(target) == 'rtl';
