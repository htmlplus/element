import { isRTL, toDecorator } from '../utils/index.js';

/**
 * Indicates whether the direction of the element is `Right-To-Left` or not.
 */
export function IsRTL() {
  return toDecorator(isRTL);
}
