import { queryAll, toDecorator } from '../utils/index.js';

/**
 * Selects all elements in the shadow dom that match a specified CSS selector.
 *
 * @param selectors A string containing one or more selectors to match against.
 * This string must be a valid
 * [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors)
 * string; if it's not, a `SyntaxError` exception is thrown. See
 * [Locating DOM elements using selectors](https://developer.mozilla.org/en-US/docs/Web/API/Document_object_model/Locating_DOM_elements_using_selectors)
 * for more information about using selectors to identify elements.
 * Multiple selectors may be specified by separating them using commas.
 */
export function QueryAll(selectors: string) {
  return toDecorator(queryAll, selectors);
}
