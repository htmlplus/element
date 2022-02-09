import * as CONSTANTS from '../../configs/constants.js';
import { PlusElement, PropertyOptions } from '../../types/index.js';
import { api, defineProperty, host, onReady, parseValue, updateAttribute } from '../utils/index.js';

export function Property(options?: PropertyOptions) {
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

        const element = host(this);

        const name = String(propertyKey);

        const raw = element.getAttribute(name);

        const [type] = target.constructor[CONSTANTS.TOKEN_STATIC_MEMBERS][propertyKey];

        const parsed = parseValue(raw, type);

        if (parsed === next) return;

        api(this)
          .request({ [propertyKey]: [next, prev] })
          .then((renderd) => {
            if (!renderd) return;
            if (!options?.reflect) return;
            updateAttribute(element, name, next);
          })
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
