import { PlusElement } from '../../types';
import { defineProperty, shadowRoot } from '../utils/index.js';

export function QueryAll(selectors: string) {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    defineProperty(target, propertyKey, {
      get() {
        return shadowRoot(this)?.querySelectorAll(selectors);
      }
    });
  };
}
