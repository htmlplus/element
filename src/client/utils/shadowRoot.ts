import { PlusElement } from '../../types';
import { host } from './host.js';

export const shadowRoot = (target: PlusElement): ShadowRoot | null => {
  return host(target)?.shadowRoot;
};
