import { PlusElement } from '../../types/index.js';
import { api, defineProperty, host, onReady } from '../utils/index.js';

export function State() {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    const values = new Map();
    defineProperty(target, propertyKey, {
      get() {
        return values.get(this)?.next;
      },
      set(input) {
        let { prev, next } = values.get(this) ?? {};

        if (input === next) return;

        values.set(this, { next: input });

        next = input;

        if (!api(this)?.ready) return;

        api(this)
          .request({ [propertyKey]: [next, prev] })
          .catch((error) => {
            throw error;
          });

        values.set(this, { prev: next, next: input });
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
