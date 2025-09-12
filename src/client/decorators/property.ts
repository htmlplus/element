import { kebabCase } from 'change-case';

import {
	defineProperty,
	host,
	requestUpdate,
	toProperty,
	updateAttribute,
	wrapMethod
} from '@/client/utils';
import * as CONSTANTS from '@/constants';
import type { HTMLPlusElement } from '@/types';

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
	type?: unknown;
}

/**
 * Creates a reactive property, reflecting a corresponding attribute value,
 * and updates the element when the property is set.
 */
export function Property(options?: PropertyOptions) {
	return (target: HTMLPlusElement, key: string, descriptor?: PropertyDescriptor) => {
		// Unique symbol for property storage to avoid naming conflicts
		const KEY = Symbol();

		// Unique symbol for the lock flag to prevent infinite loops during updates
		const LOCKED = Symbol();

		// Calculate attribute name from the property key if not explicitly provided
		const attribute = options?.attribute || kebabCase(key);

		// Store the original setter (if it exists) to preserve its behavior
		const originalSetter = descriptor?.set;

		// Ensure the element class has an observedAttributes array
		// biome-ignore lint: TODO
		target.constructor['observedAttributes'] ||= [];

		// Register the attribute in the observedAttributes array for the element
		// biome-ignore lint: TODO
		target.constructor['observedAttributes'].push(attribute);

		// Getter function to retrieve the property value
		function get(this) {
			return this[KEY];
		}

		// Setter function to update the property value and trigger updates
		function set(this, value) {
			// Store the previous value
			const previous = this[KEY];

			// Store the new value
			const next = value;

			// Skip updates if the value hasn't changed and no custom setter is defined
			if (!originalSetter && next === previous) return;

			// If a custom setter exists, call it with the new value
			if (originalSetter) {
				originalSetter.call(this, next);
			}
			// Otherwise, update the property directly
			else {
				this[KEY] = next;
			}

			// Request an update
			requestUpdate(this, key, previous, (skipped) => {
				// Skip if the update was aborted
				if (skipped) return;

				// If reflection is enabled, update the corresponding attribute
				if (!options?.reflect) return;

				// Lock to prevent infinite loops
				this[LOCKED] = true;

				// Update the attribute
				updateAttribute(this, attribute, next);

				// Unlock
				this[LOCKED] = false;
			});
		}

		// Override the property descriptor if a custom setter exists
		if (originalSetter) {
			descriptor.set = set;
		}

		// Attach the getter and setter to the target class property if no descriptor exists
		if (!descriptor) {
			defineProperty(target, key, { configurable: true, get, set });
		}

		/**
		 * Define a raw property setter to handle updates that trigger from the `attributeChangedCallback`,
		 * To intercept and process raw attribute values before they are assigned to the property
		 */
		defineProperty(target, `RAW:${attribute}`, {
			set(value) {
				if (!this[LOCKED]) {
					// Convert the raw value and set it to the corresponding property
					this[key] = toProperty(value, options?.type);
				}
			}
		});

		// TODO
		wrapMethod('before', target, CONSTANTS.LIFECYCLE_CONNECTED, function () {
			this[CONSTANTS.API_DEFAULTS] ||= {};
			this[CONSTANTS.API_DEFAULTS][key] = this[key];
		});

		// Attach getter and setter to the host element on construction
		wrapMethod('before', target, CONSTANTS.LIFECYCLE_CONSTRUCTED, function () {
			const get = () => {
				if (descriptor && !descriptor.get) {
					throw new Error(`Property '${key}' does not have a getter. Unable to retrieve value.`);
				}
				return this[key];
			};

			const set = (value) => {
				if (descriptor && !descriptor.set) {
					throw new Error(`Property '${key}' does not have a setter. Unable to assign value.`);
				}
				this[key] = value;
			};

			defineProperty(host(this), key, { configurable: true, get, set });
		});

		/**
		 * TODO: Review these behaviors again.
		 *
		 * When a property has a reflect and either a getter, a setter, or both are available,
		 * three approaches are possible:
		 *
		 * 1. Only a getter is present: The attribute updates after each render is completed.
		 * 2. Only a setter is present: The attribute updates after each setter call.
		 * 3. Both getter and setter are present: The attribute is updated via the setter call
		 *    and also after each render is completed, resulting in two attribute update processes.
		 */
		if (options?.reflect && descriptor?.get) {
			wrapMethod('before', target, CONSTANTS.LIFECYCLE_UPDATED, function () {
				// Lock to prevent infinite loops
				this[LOCKED] = true;

				// Update the attribute
				updateAttribute(this, attribute, this[key]);

				// Unlock
				this[LOCKED] = false;
			});
		}
	};
}
