import { PlusElement } from '../../types/index.js';
/**
 * Selects all elements in the shadow dom that match a specified CSS selector.
 */
export declare function queryAll(target: PlusElement, selectors: string): NodeListOf<Element> | undefined;
