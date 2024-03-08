import { kebabCase } from 'change-case';

import * as CONSTANTS from '../../constants/index.js';
import { HTMLPlusElement } from '../../types';
import {
  appendToMethod,
  defineProperty,
  host,
  request,
  toProperty,
  updateAttribute
} from '../utils/index.js';

/**
 * The configuration for property decorator.
 */
export interface PropertyOptions {
  /**
   * Whether property value is reflected back to the associated attribute. default is `false`.
   */
  reflect?: boolean;
  /**
   * Do not set the value to this property. This value is automatically set during transforming.
   */
  type?: number;
}

/**
 * Creates a reactive property, reflecting a corresponding attribute value,
 * and updates the element when the property is set.
 */
export function Property(options?: PropertyOptions) {
  return function (target: HTMLPlusElement, key: PropertyKey, descriptor?: PropertyDescriptor) {
    // Converts property name to string.
    const name = String(key);

    // Registers an attribute that is intricately linked to the property.
    (target.constructor['observedAttributes'] ||= []).push(kebabCase(name));

    // TODO: This feature is an experimental
    // When the property is a getter function.
    if (descriptor) {
      // Checks the reflection.
      if (options?.reflect) {
        // Stores the original getter function.
        const getter = descriptor.get;

        // Defines a new getter function.
        descriptor.get = function () {
          const value = getter?.apply(this);

          this[CONSTANTS.API_LOCKED] = true;

          updateAttribute(this, name, value);

          this[CONSTANTS.API_LOCKED] = false;

          return value;
        };

        // TODO: Check the lifecycle
        appendToMethod(target, CONSTANTS.LIFECYCLE_UPDATED, function () {
          // Calls the getter function to update the related attribute.
          this[name];
        });
      }
    }
    // When the property is normal.
    else {
      // Creates a unique symbol.
      const symbol = Symbol();

      // Defines a getter function to use in the target class.
      function get(this) {
        return this[symbol];
      }

      // Defines a setter function to use in the target class.
      function set(this, next) {
        const previous = this[symbol];

        if (next === previous) return;

        this[symbol] = next;

        request(this, name, previous, (skipped) => {
          if (skipped) return;

          if (!options?.reflect) return;

          this[CONSTANTS.API_LOCKED] = true;

          updateAttribute(this, name, next);

          this[CONSTANTS.API_LOCKED] = false;
        });
      }

      // Attaches the getter and setter functions to the current property of the target class.
      defineProperty(target, key, { get, set });
    }

    // TODO: Check the lifecycle
    appendToMethod(target, CONSTANTS.LIFECYCLE_CONSTRUCTED, function () {
      // Defines a getter function to use in the host element.
      const get = () => {
        return this[key];
      };

      // Defines a setter function to use in the host element.
      const set = descriptor
        ? undefined
        : (input) => {
            if (this[CONSTANTS.API_LOCKED]) {
              return;
            }
            this[key] = toProperty(input, options?.type);
          };

      // TODO: Check the configuration.
      // Attaches the getter and setter functions to the current property of the host element.
      defineProperty(host(this), key, { get, set, configurable: true });
    });
  };
}
