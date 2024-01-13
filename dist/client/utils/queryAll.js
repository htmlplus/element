import { shadowRoot } from './shadowRoot.js';
/**
 * Selects all elements in the shadow dom that match a specified CSS selector.
 */
export function queryAll(target, selectors) {
    var _a;
    return (_a = shadowRoot(target)) === null || _a === void 0 ? void 0 : _a.querySelectorAll(selectors);
}
