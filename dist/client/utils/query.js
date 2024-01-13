import { shadowRoot } from './shadowRoot.js';
/**
 * Selects the first element in the shadow dom that matches a specified CSS selector.
 */
export function query(target, selectors) {
    var _a;
    return (_a = shadowRoot(target)) === null || _a === void 0 ? void 0 : _a.querySelector(selectors);
}
