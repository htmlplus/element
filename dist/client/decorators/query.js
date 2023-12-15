import { query, toDecorator } from '../utils/index.js';
/**
 * Selects the first element in the shadow dom that matches a specified CSS selector.
 */
export function Query(selectors) {
    return toDecorator(query, selectors);
}
