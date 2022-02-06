import * as CONSTANTS from '../../configs/constants.js';
import { PlusElement } from '../../types/index.js';
import { host } from '../helpers/index.js';
import { appendToMethod, sync } from '../utils/index.js';

export function Attributes() {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    let update;
    appendToMethod(target, CONSTANTS.TOKEN_LIFECYCLE_CONNECTED, function () {
      update = sync(host(this));
    });
    appendToMethod(target, CONSTANTS.TOKEN_LIFECYCLE_UPDATED, function () {
      update(this[propertyKey]);
    });
  };
}
