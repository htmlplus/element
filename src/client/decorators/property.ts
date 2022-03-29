import { PlusElement } from '../../types/index.js';
import { defineProperty, getMembers, host, parseValue, request, updateAttribute, onReady } from '../utils/index.js';

export interface PropertyOptions {
  /**
   * TODO
   */
  attribute?: boolean | string;
  /**
   * Whether property value is reflected back to the associated attribute. default is `false`.
   */
  reflect?: boolean;
}

export function Property(options?: PropertyOptions) {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    const values = new Map();
    defineProperty(target, propertyKey, {
      get() {
        return values.get(this);
      },
      set(input) {
        const value = values.get(this);

        if (value === input) return;

        values.set(this, input);

        request(this, { [propertyKey]: [input, value] })
          .then((renderd) => {
            if (!renderd) return;

            if (!options?.reflect) return;

            const element = host(this);

            const name = String(propertyKey);

            const raw = element.getAttribute(name);

            const [type] = getMembers(target)[propertyKey];

            const parsed = parseValue(raw, type);

            if (parsed === input) return;

            updateAttribute(element, name, input);
          })
          .catch((error) => {
            throw error;
          });
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
