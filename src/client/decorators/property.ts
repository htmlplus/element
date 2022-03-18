import * as CONSTANTS from '../../configs/constants.js';
import { PlusElement } from '../../types/index.js';
import { api, defineProperty, host, parseValue, updateAttribute, onReady } from '../utils/index.js';

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
        return values.get(this)?.next;
      },
      set(input) {
        let { prev, next } = values.get(this) ?? {};

        if (input === next) return;

        values.set(this, { next: input });

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

        values.set(this, { prev: next, next: input });
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
