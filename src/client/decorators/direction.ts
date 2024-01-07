import { direction, toDecorator } from '../utils/index.js';

/**
 * Indicates whether the [Direction](https://mdn.io/css-direction)
 * of the element is `Right-To-Left` or `Left-To-Right`.
 */
export function Direction() {
  return toDecorator(direction);
}
