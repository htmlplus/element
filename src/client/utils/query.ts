import { PlusElement } from '../../types/index.js';
import { shadowRoot } from './shadowRoot.js';

export function query(target: PlusElement, selectors: string) {
  return shadowRoot(target)?.querySelector(selectors);
}
