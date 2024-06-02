import { kebabCase } from 'change-case';

import * as CONSTANTS from '../../constants/index.js';
import { HTMLPlusElement } from '../../types/index.js';
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
   * Specifies the name of the attribute related to the property.
   */
  attribute?: string;
  /**
   * Whether property value is reflected back to the associated attribute. default is `false`.
   */
  reflect?: boolean;
  /**
   * Specifies the property `type` and supports
   * [data types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures).
   * If this value is not set, it will be set automatically during transforming.
   */
  type?: any;
}

/**
 * Creates a reactive property, reflecting a corresponding attribute value,
 * and updates the element when the property is set.
 */
export function Property(options?: PropertyOptions) {
  return function (target: HTMLPlusElement, key: PropertyKey, descriptor?: PropertyDescriptor) {
    // Creates a unique symbol for the lock flag.
    const locked = Symbol();

    // Converts property name to string.
    const name = String(key);

    // Calculates attribute.
    const attribute = options?.attribute || kebabCase(name);

    // Registers an attribute that is intricately linked to the property.
    (target.constructor['observedAttributes'] ||= []).push(attribute);

    // TODO
    if (attribute) {
      // TODO
      target.constructor[CONSTANTS.MAPPER] ||= {};

      // TODO
      target.constructor[CONSTANTS.MAPPER][attribute] = name;
    }

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

          this[locked] = true;

          updateAttribute(this as HTMLPlusElement, attribute, value);

          this[locked] = false;

          return value;
        };

        // TODO: Check the lifecycle
        appendToMethod(target, CONSTANTS.LIFECYCLE_UPDATED, function () {
          // Calls the getter function to update the related attribute.
          this[key];
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

          this[locked] = true;

          updateAttribute(this, attribute, next);

          this[locked] = false;
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
            if (this[locked]) {
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
