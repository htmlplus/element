import { defineProperty } from '../utils';

/**
 * Used to bind a method of a class to the current context,
 * making it easier to reference `this` within the method.
 */
export function Bind() {
	return (_target: object, key: PropertyKey, descriptor: PropertyDescriptor) => {
		const original = descriptor.value;

		return {
			configurable: true,
			get() {
				const next = original.bind(this);

				defineProperty(this, key, {
					value: next,
					configurable: true,
					writable: true
				});

				return next;
			}
		};
	};
}
