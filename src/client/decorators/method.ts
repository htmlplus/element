import * as CONSTANTS from '../../constants/index.js';
import { HTMLPlusElement } from '../../types/index.js';
import { host, wrapMethod } from '../utils/index.js';

/**
 * Provides a way to encapsulate functionality within an element
 * and invoke it as needed, both internally and externally.
 */
export function Method() {
  return function (target: HTMLPlusElement, key: PropertyKey, descriptor: PropertyDescriptor) {
    wrapMethod('before', target, CONSTANTS.LIFECYCLE_CONSTRUCTED, function () {
      host(this)[key] = this[key].bind(this);
    });
  };
}
