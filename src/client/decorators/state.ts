import { PlusElement } from '../../types/index.js';
import { api, defineProperty, host, onReady } from '../utils/index.js';

export function State() {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    let prev, next;
    defineProperty(target, propertyKey, {
      get() {
        return next;
      },
      set(input) {
        if (input === next) return;

        next = input;

        if (!api(this)?.ready) return;

        api(this)
          .request({ [propertyKey]: [next, prev] })
          .catch((error) => {
            throw error;
          });

        prev = next;
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
