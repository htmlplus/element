import * as CONSTANTS from '../../constants/index.js';
import { appendToMethod, defineProperty, host } from '../utils/index.js';
export function Method() {
    return function (target, propertyKey) {
        appendToMethod(target, CONSTANTS.LIFECYCLE_CONNECTED, function () {
            defineProperty(host(this), propertyKey, {
                get: () => this[propertyKey].bind(this)
            });
        });
    };
}
