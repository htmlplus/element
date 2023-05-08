import { defineProperty, shadowRoot } from '../utils/index.js';
export function Query(selectors) {
    return function (target, propertyKey) {
        defineProperty(target, propertyKey, {
            get() {
                var _a;
                return (_a = shadowRoot(this)) === null || _a === void 0 ? void 0 : _a.querySelector(selectors);
            }
        });
    };
}
