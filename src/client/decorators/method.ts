import * as CONSTANTS from '@/constants';
import type { HTMLPlusElement } from '@/types';

import { host, wrapMethod } from '../utils';

/**
 * Provides a way to encapsulate functionality within an element
 * and invoke it as needed, both internally and externally.
 */
export function Method() {
	return (target: HTMLPlusElement, key: PropertyKey, _descriptor: PropertyDescriptor) => {
		wrapMethod('before', target, CONSTANTS.LIFECYCLE_CONSTRUCTED, function () {
			host(this)[key] = this[key].bind(this);
		});
	};
}
