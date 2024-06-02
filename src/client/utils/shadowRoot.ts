import { HTMLPlusElement } from '../../types/index.js';
import { host } from './host.js';

export const shadowRoot = (target: HTMLElement | HTMLPlusElement): ShadowRoot | null => {
  return host(target)?.shadowRoot;
};
