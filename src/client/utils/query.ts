import { HTMLPlusElement } from '../../types/index.js';
import { shadowRoot } from './shadowRoot.js';

/**
 * Selects the first element in the shadow dom that matches a specified CSS selector.
 */
export function query(target: HTMLPlusElement, selectors: string) {
  return shadowRoot(target)?.querySelector(selectors);
}
