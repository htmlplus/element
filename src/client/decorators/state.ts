import { PlusElement } from '../../types';
import { defineProperty, request } from '../utils/index.js';

export function State() {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    const name = String(propertyKey);

    const symbol = Symbol();

    function get(this) {
      return this[symbol];
    }

    function set(this, next) {
      const previous = this[symbol];

      if (next === previous) return;

      this[symbol] = next;

      request(this, name, previous);
    }

    // TODO: configurable
    defineProperty(target, propertyKey, { get, set, configurable: true });
  };
}
