import { direction, toDecorator } from '@/client/utils';

/**
 * Indicates whether the [Direction](https://mdn.io/css-direction)
 * of the element is `Right-To-Left` or `Left-To-Right`.
 */
export function Direction() {
	return toDecorator(direction);
}
