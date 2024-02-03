import { slots, toDecorator } from '../utils/index.js';

/**
 * Returns the slots name.
 */
export function Slots() {
  return toDecorator(slots);
}
