import { HTMLPlusElement } from '../../types/index.js';
import { defineProperty } from './defineProperty.js';

export function toDecorator(util: Function, ...args: any[]) {
  return function (target: HTMLPlusElement, key: PropertyKey) {
    defineProperty(target, key, {
      get() {
        return util(this, ...args);
      }
    });
  };
}
