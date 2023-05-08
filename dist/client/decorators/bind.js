import { defineProperty } from '../utils/index.js';
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
