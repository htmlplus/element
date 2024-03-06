/**
 * Selects the first element in the shadow dom that matches a specified CSS selector.
 *
 * @param selectors A string containing one or more selectors to match.
 * This string must be a valid CSS selector string; if it isn't, a `SyntaxError` exception is thrown. See
 * [Locating DOM elements using selectors](https://developer.mozilla.org/en-US/docs/Web/API/Document_object_model/Locating_DOM_elements_using_selectors)
 * for more about selectors and how to manage them.
 */
export declare function Query(selectors: string): (target: import("../../types/index.js").HTMLPlusElement, key: PropertyKey) => void;
