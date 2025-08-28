import { host, toDecorator } from '@/client/utils';

/**
 * Indicates the host of the element.
 */
export function Host() {
	return toDecorator(host);
}
