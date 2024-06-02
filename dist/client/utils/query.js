import { shadowRoot } from './shadowRoot.js';
/**
 * Selects the first element in the shadow dom that matches a specified CSS selector.
 */
export function query(target, selectors) {
    return shadowRoot(target)?.querySelector(selectors);
}
