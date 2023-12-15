import { defineProperty } from './defineProperty.js';
export function toDecorator(util, ...parameters) {
    return function (target, propertyKey) {
        defineProperty(target, propertyKey, {
            get() {
                return util(this, ...parameters);
            }
        });
    };
}
