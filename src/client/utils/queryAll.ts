import { HTMLPlusElement } from '../../types';
import { shadowRoot } from './shadowRoot.js';

/**
 * Selects all elements in the shadow dom that match a specified CSS selector.
 */
export function queryAll(target: HTMLPlusElement, selectors: string) {
  return shadowRoot(target)?.querySelectorAll(selectors);
}
