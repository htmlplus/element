import * as CONSTANTS from '../../configs/constants.js';
import { PlusElement } from '../../types/index.js';
import { host } from '../helpers/index.js';
import { defineMethod, sync } from '../utils/index.js';

export function Attributes() {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    let update;
    defineMethod(target, CONSTANTS.TOKEN_LIFECYCLE_CONNECTED, function (instance, callback, args) {
      update = sync(host(instance));
      return callback?.(...args);
    });
    defineMethod(target, CONSTANTS.TOKEN_LIFECYCLE_UPDATED, function (instance, callback, args) {
      update(instance[propertyKey]);
      return callback?.(...args);
    });
  };
}
