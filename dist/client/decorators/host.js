import { defineProperty, host } from '../utils/index.js';
export function Host() {
    return function (target, propertyKey) {
        defineProperty(target, propertyKey, {
            get() {
                return host(this);
            }
        });
    };
}
