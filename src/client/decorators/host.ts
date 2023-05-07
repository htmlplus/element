import { PlusElement } from '../../types';
import { defineProperty, host } from '../utils/index.js';

export function Host() {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    defineProperty(target, propertyKey, {
      get() {
        return host(this);
      }
    });
  };
}
