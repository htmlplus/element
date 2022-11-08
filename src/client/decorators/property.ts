import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types';
import {
  defineProperty,
  host,
  request,
  appendToMethod,
  updateAttribute,
  getConfig,
  getMembers,
  getTag
} from '../utils/index.js';

export interface PropertyOptions {
  /**
   * Whether property value is reflected back to the associated attribute. default is `false`.
   */
  reflect?: boolean;
}

export function Property(options?: PropertyOptions) {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    const name = String(propertyKey);

    const symbol = Symbol();

    function get(this) {
      return this[symbol];
    }

    function set(this, next) {
      const previous = this[symbol];

      if (next === previous) return;

      this[symbol] = next;

      request(this, name, previous, (skip) => {
        if (!options?.reflect || skip) return;

        target[CONSTANTS.API_LOCKED] = true;

        updateAttribute(host(this), name, next);

        target[CONSTANTS.API_LOCKED] = false;
      });
    }

    defineProperty(target, propertyKey, { get, set });

    appendToMethod(target, CONSTANTS.LIFECYCLE_CONNECTED, function () {
      const element = host(this);

      // TODO: experimental for global config
      if (getMembers(this)[name]?.default === this[name]) {
        const config = getConfig('component', getTag(target)!, 'property', name);
        if (typeof config != 'undefined') this[name] = config;
      }

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
