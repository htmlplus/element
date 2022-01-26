import * as CONSTANTS from '../../configs/constants.js';
import { PlusElement } from '../../types/index.js';
import { defineMethod } from '../utils/index.js';

export function Watch(...keys: Array<string>) {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    defineMethod(target, CONSTANTS.TOKEN_LIFECYCLE_UPDATED, function (instance, callback, args) {
      const [states] = args;
      for (const key of keys) states?.[key] && instance[propertyKey](...states[key], key);
      return callback?.(...args);
    });
  };
}
