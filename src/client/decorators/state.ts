import { PlusElement } from '../../types/index.js';
import { api, host, onReady } from '../utils/index.js';

export function State() {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    let prev, next;
    Object.defineProperty(target, propertyKey, {
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
      Object.defineProperty(host(this), propertyKey, {
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
