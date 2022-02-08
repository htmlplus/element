import * as CONSTANTS from '../../configs/constants.js';
import { PlusElement } from '../../types';
import { appendToMethod } from '../utils';

// TODO: support * key
export function Watch(...keys: Array<string>) {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    if (!keys.length) return;
    appendToMethod(target, CONSTANTS.TOKEN_LIFECYCLE_UPDATED, function (args) {
      const [states] = args;
      for (const key of keys) {
        if (states?.[key]) {
          this[propertyKey](...states[key], key);
        }
      }
    });
  };
}
