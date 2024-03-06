import * as CONSTANTS from '../../constants/index.js';
import { appendToMethod, defineProperty, host } from '../utils/index.js';
/**
 * Provides a way to encapsulate functionality within an element
 * and invoke it as needed, both internally and externally.
 */
export function Method() {
    return function (target, key) {
        appendToMethod(target, CONSTANTS.LIFECYCLE_CONSTRUCTED, function () {
            defineProperty(host(this), key, {
                get: () => this[key].bind(this)
            });
        });
    };
}
