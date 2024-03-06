import { defineProperty } from './defineProperty.js';
export function toDecorator(util, ...parameters) {
    return function (target, key) {
        defineProperty(target, key, {
            get() {
                return util(this, ...parameters);
            }
        });
    };
}
