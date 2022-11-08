import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types';
import { appendToMethod, defineProperty, host } from '../utils/index.js';

export function Method() {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    appendToMethod(target, CONSTANTS.LIFECYCLE_CONNECTED, function () {
      defineProperty(host(this), propertyKey, {
        get: () => this[propertyKey].bind(this)
      });
    });
  };
}
