import { defineProperty } from '../utils/index.js';
/**
 * Used to bind a method of a class to the current context,
 * making it easier to reference `this` within the method.
 */
export function Bind() {
    return function (target, propertyKey, descriptor) {
        return {
            configurable: true,
            get() {
                const value = descriptor === null || descriptor === void 0 ? void 0 : descriptor.value.bind(this);
                defineProperty(this, propertyKey, {
                    value,
                    configurable: true,
                    writable: true
                });
                return value;
            }
        };
    };
}