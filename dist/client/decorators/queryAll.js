import { queryAll, toDecorator } from '../utils/index.js';
/**
 * Selects all elements in the shadow dom that match a specified CSS selector.
 */
export function QueryAll(selectors) {
    return toDecorator(queryAll, selectors);
}
