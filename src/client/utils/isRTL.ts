import { HTMLPlusElement } from '../../types/index.js';
import { direction } from './direction.js';

/**
 * Indicates whether the direction of the element is `Right-To-Left` or not.
 */
export const isRTL = (target: HTMLPlusElement): boolean => direction(target) == 'rtl';
