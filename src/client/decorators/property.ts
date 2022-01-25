import { PlusElement, PropertyOptions } from '../../types/index.js';
import { DecoratorSetup, api, decorator, defineProperty, parseValue, updateAttribute } from '../utils/index.js';

export function Property(options?: PropertyOptions) {
  const setup: DecoratorSetup = (target: PlusElement, propertyKey: PropertyKey) => {
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

        // TODO
        const raw = api(this).host().getAttribute(String(propertyKey));
        const [type] = target.constructor['members'][propertyKey];
        const parsed = parseValue(raw, type);
        if (parsed === value) return;
        if (options?.reflect) updateAttribute(api(this).host(), String(propertyKey), value);
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
