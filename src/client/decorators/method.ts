import { PlusElement } from '../../types/index.js';
import { host, onReady } from '../utils/index.js';

export function Method() {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    onReady(target, function () {
      Object.defineProperty(host(this), propertyKey, {
        get: () => {
          return this[propertyKey].bind(this);
        }
      });
    });
  };
}
