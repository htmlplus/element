import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types/index.js';
import { appendToMethod } from '../utils/index.js';

// TODO: support * key
export function Watch(...keys: Array<string>) {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    if (!keys.length) return;
    appendToMethod(target, CONSTANTS.LIFECYCLE_UPDATED, function (args) {
      const [states] = args;
      for (const key of keys) {
        if (states?.[key]) {
          this[propertyKey](...states[key], key);
        }
      }
    });
  };
}
