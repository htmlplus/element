import { isRTL, toDecorator } from '../utils';

/**
 * Indicates whether the direction of the element is `Right-To-Left` or not.
 */
export function IsRTL() {
	return toDecorator(isRTL);
}
