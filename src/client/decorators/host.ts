import { host, toDecorator } from '../utils';

/**
 * Indicates the host of the element.
 */
export function Host() {
	return toDecorator(host);
}
