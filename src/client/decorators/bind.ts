import { defineProperty } from '../utils/index.js';

/**
 * Used to bind a method of a class to the current context,
 * making it easier to reference `this` within the method.
 */
export function Bind() {
  return function (target: Object, key: PropertyKey, descriptor: PropertyDescriptor) {
    return {
      configurable: true,
      get() {
        const value = descriptor?.value!.bind(this);
        defineProperty(this, key, {
          value,
          configurable: true,
          writable: true
        });
        return value;
      }
    };
  };
}
