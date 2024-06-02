import { HTMLPlusElement } from '../../types/index.js';
import { defineProperty, request } from '../utils/index.js';

/**
 * Applying this decorator to any `class property` will trigger the
 * element to re-render upon the desired property changes.
 */
export function State() {
  return function (target: HTMLPlusElement, key: PropertyKey) {
    const name = String(key);

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
    defineProperty(target, key, { get, set, configurable: true });
  };
}
