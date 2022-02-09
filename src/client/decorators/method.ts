import { PlusElement } from '../../types/index.js';
import { defineProperty, host, onReady } from '../utils/index.js';

export function Method() {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    onReady(target, function () {
      defineProperty(host(this), propertyKey, {
        get: () => {
          return this[propertyKey].bind(this);
        }
      });
    });
  };
}
