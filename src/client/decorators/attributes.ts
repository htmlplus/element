import * as CONSTANTS from '../../configs/constants.js';
import { PlusElement } from '../../types/index.js';
import { defineMethod, sync } from '../utils/index.js';

export function Attributes() {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    let update;
    defineMethod(target, CONSTANTS.TOKEN_LIFECYCLE_CONNECTED, function (instance, callback, args) {
      update = sync(instance);
      return callback?.(...args);
    });
    defineMethod(target, CONSTANTS.TOKEN_LIFECYCLE_UPDATE, function (instance, callback, args) {
      update(instance[propertyKey]);
      return callback?.(...args);
    });
  };
}
