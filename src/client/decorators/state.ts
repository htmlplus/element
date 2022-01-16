import * as Utils from '../utils/index.js';
import { DecoratorSetup, decorator } from '../utils/index.js';

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

        const api = Utils.api(this);

        if (!api.ready) return;

        api.state(propertyKey as string, input);

        // TODO
        // this.render();
      },
      onReady(host: HTMLElement) {
        Object.defineProperty(host, propertyKey, {
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
