import { slots, toDecorator } from '@/client/utils';

/**
 * Returns the slots name.
 */
export function Slots() {
	return toDecorator(slots);
}
