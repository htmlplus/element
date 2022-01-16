import { PropertyOptions } from '../../types/index.js';
import * as Utils from '../utils/index.js';
import { DecoratorSetup, decorator } from '../utils/index.js';

export function Property(options?: PropertyOptions) {
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

        if (!api?.ready) return;

        api.property(propertyKey as string, input, options);

        // TODO
        // const raw = this.getAttribute(name);
        // const [type] = members[name];
        // const parsed = parseValue(raw, type);
        // if (parsed === value) return;
        // if (options.reflect) updateAttribute(this, name, value);
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
