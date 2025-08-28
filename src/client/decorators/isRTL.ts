import { isRTL, toDecorator } from '@/client/utils';

/**
 * Indicates whether the direction of the element is `Right-To-Left` or not.
 */
export function IsRTL() {
	return toDecorator(isRTL);
}
