import { slots, toDecorator } from '../utils';

/**
 * Returns the slots name.
 */
export function Slots() {
	return toDecorator(slots);
}
