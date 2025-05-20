import { Bind } from './bind.js';

/**
 * A method decorator that applies debounce behavior to a class method.
 * Ensures that the method executes only after the specified delay,
 * resetting the timer if called again within the delay period.
 *
 * @param {number} delay - The debounce delay in milliseconds.
 */
export function Debounce(delay: number = 0) {
  return function (target: Object, key: PropertyKey, descriptor: PropertyDescriptor) {
    const KEY = Symbol();

    const original = descriptor.value;

    function clear(this: any) {
      if (!Object.hasOwn(this, KEY)) return;

      clearTimeout(this[KEY] as number);

      delete this[KEY];
    }

    function debounced(this: any, ...args: any[]) {
      clear.call(this);

      this[KEY] = window.setTimeout(() => {
        clear.call(this);
        original.apply(this, args);
      }, delay);
    }

    descriptor.value = debounced;

    return Bind()(target, key, descriptor);
  };
}
