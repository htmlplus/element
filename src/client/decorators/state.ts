import { PlusElement } from '../../types/index.js';
import { host } from '../helpers/index.js';
import { DecoratorSetup, api, decorator, defineProperty } from '../utils/index.js';

export function State() {
  const setup: DecoratorSetup = (target: PlusElement, propertyKey: PropertyKey) => {
    let prev, next;
    return {
      get() {
        return next;
      },
      set(input) {
        if (input === next) return;

        next = input;

        if (!api(this)?.ready) return;

        api(this).request({ [propertyKey]: [next, prev] });

        prev = next;
      },
      onReady() {
        defineProperty(host(this), propertyKey, {
          get: () => {
            return this[propertyKey];
          },
          set: (value) => {
            this[propertyKey] = value;
          }
        });
      }
    };
  };
  return decorator(setup);
}
