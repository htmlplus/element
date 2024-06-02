import { shadowRoot } from './shadowRoot.js';
/**
 * Selects all elements in the shadow dom that match a specified CSS selector.
 */
export function queryAll(target, selectors) {
    return shadowRoot(target)?.querySelectorAll(selectors);
}
