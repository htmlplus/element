import { HTMLPlusElement } from '../../types';
import { defineProperty } from './defineProperty.js';

export function toDecorator(util: Function, ...parameters: any[]) {
  return function (target: HTMLPlusElement, key: PropertyKey) {
    defineProperty(target, key, {
      get() {
        return util(this, ...parameters);
      }
    });
  };
}
