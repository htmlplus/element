import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types';
import { appendToMethod, defineProperty, host } from '../utils/index.js';

/**
 * Provides a way to encapsulate functionality within an element
 * and invoke it as needed, both internally and externally.
 */
export function Method() {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    appendToMethod(target, CONSTANTS.LIFECYCLE_CONSTRUCTED, function () {
      defineProperty(host(this), propertyKey, {
        get: () => this[propertyKey].bind(this)
      });
    });
  };
}
