import { PlusElement } from '../../types/index.js';
import { defineProperty, host, onReady, request } from '../utils/index.js';

export function State() {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    const values = new Map();
    defineProperty(target, propertyKey, {
      get() {
        return values.get(this);
      },
      set(input) {
        const value = values.get(this);

        if (value === input) return;

        values.set(this, input);

        request(this, { [propertyKey]: [input, value] })
          .then(() => {})
          .catch((error) => {
            throw error;
          });
      }
    });
    onReady(target, function () {
      defineProperty(host(this), propertyKey, {
        get: () => {
          return this[propertyKey];
        },
        set: (value) => {
          this[propertyKey] = value;
        }
      });
    });
  };
}
