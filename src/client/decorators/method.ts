import { PlusElement } from '../../types';
import { host, onReady } from '../utils';

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
