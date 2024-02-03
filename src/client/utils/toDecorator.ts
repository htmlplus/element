import { PlusElement } from '../../types/index.js';
import { defineProperty } from './defineProperty.js';

export function toDecorator(util: Function, ...parameters: any[]) {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    defineProperty(target, propertyKey, {
      get() {
        return util(this, ...parameters);
      }
    });
  };
}
