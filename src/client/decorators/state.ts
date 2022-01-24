import { DecoratorSetup, api, decorator, defineProperty } from '../utils/index.js';

export function State() {
  const setup: DecoratorSetup = (target: Object, propertyKey: PropertyKey) => {
    let value;
    return {
      type: 'property',
      get() {
        return value;
      },
      set(input) {
        if (input === value) return;

        value = input;

        if (!api(this)?.ready) return;

        api(this).render();
      },
      onReady(host: HTMLElement) {
        defineProperty(host, propertyKey, {
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
