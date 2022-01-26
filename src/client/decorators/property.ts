import * as CONSTANTS from '../../configs/constants.js';
import { PlusElement, PropertyOptions } from '../../types/index.js';
import { host } from '../helpers/index.js';
import { DecoratorSetup, api, decorator, defineProperty, parseValue, updateAttribute } from '../utils/index.js';

export function Property(options?: PropertyOptions) {
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

        const element = host(this);

        const name = String(propertyKey);

        const raw = element.getAttribute(name);

        const [type] = target.constructor[CONSTANTS.TOKEN_STATIC_MEMBERS][propertyKey];

        const parsed = parseValue(raw, type);

        if (parsed === value) return;

        if (options?.reflect) updateAttribute(element, name, value);

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
