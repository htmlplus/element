import { PlusElement } from '../../types/index.js';
import { shadowRoot } from './shadowRoot.js';

export function queryAll(target: PlusElement, selectors: string) {
  return shadowRoot(target)?.querySelectorAll(selectors);
}
