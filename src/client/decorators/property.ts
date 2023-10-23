import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types';
import {
  addMember,
  appendToMethod,
  defineProperty,
  host,
  request,
  toProperty,
  updateAttribute
} from '../utils/index.js';

export interface PropertyOptions {
  /**
   * Whether property value is reflected back to the associated attribute. default is `false`.
   */
  reflect?: boolean;
  /**
   * TODO
   */
  type?: number;
}

export function Property(options?: PropertyOptions) {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    const name = String(propertyKey);

    const symbol = Symbol();

    addMember(target.constructor, name, options);

    function get(this) {
      return this[symbol];
    }

    function set(this, next) {
      const previous = this[symbol];

      const parsed = toProperty(next, options?.type);

      if (parsed === previous) return;

      this[symbol] = parsed;

      request(this, name, previous, (skipped) => {
        if (!options?.reflect || skipped) return;

        target[CONSTANTS.API_LOCKED] = true;

        updateAttribute(host(this), name, parsed);

        target[CONSTANTS.API_LOCKED] = false;
      });
    }

    defineProperty(target, propertyKey, { get, set });

    // TODO: check the lifecycle
    appendToMethod(target, CONSTANTS.LIFECYCLE_CONSTRUCTED, function () {
      const element = host(this);

      // TODO: experimental for isolated options
      if (element === this) return;

      const get = () => {
        return this[propertyKey];
      };

      const set = (input) => {
        this[propertyKey] = input;
      };

      // TODO: configurable
      defineProperty(element, propertyKey, { get, set, configurable: true });
    });
  };
}
