import { PlusElement } from '../../types/index.js';
import { host } from '../helpers/index.js';
import { DecoratorSetup, api, decorator, defineProperty } from '../utils/index.js';

export function State() {
  const setup: DecoratorSetup = (target: PlusElement, propertyKey: PropertyKey) => {
    let value;
    return {
      get() {
        return value;
      },
      set(input) {
        if (input === value) return;

        value = input;

        if (!api(this)?.ready) return;

        api(this).request();
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
