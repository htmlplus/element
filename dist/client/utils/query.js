import { shadowRoot } from './shadowRoot.js';
export function query(target, selectors) {
    var _a;
    return (_a = shadowRoot(target)) === null || _a === void 0 ? void 0 : _a.querySelector(selectors);
}