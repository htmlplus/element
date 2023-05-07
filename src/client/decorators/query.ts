import { PlusElement } from '../../types';
import { defineProperty, shadowRoot } from '../utils/index.js';

export function Query(selectors: string) {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    defineProperty(target, propertyKey, {
      get() {
        return shadowRoot(this)?.querySelector(selectors);
      }
    });
  };
}
