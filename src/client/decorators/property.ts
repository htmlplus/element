import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types';
import {
  addMember,
  appendToMethod,
  defineProperty,
  getConfig,
  getMembers,
  getTag,
  host,
  request,
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
