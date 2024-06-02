import { HTMLPlusElement } from '../../types/index.js';
import { host } from './host.js';

type Slots = {
  [key: string]: boolean;
};

/**
 * Returns the slots name.
 */
export const slots = (target: HTMLElement | HTMLPlusElement): Slots => {
  const element = host(target);

  const slots = {};

  const children = Array.from(element.childNodes);

  for (const child of children) {
    if (child.nodeName == '#comment') continue;

    const name =
      child['slot'] || (child.nodeValue?.trim() && 'default') || ('slot' in child && 'default');

    if (!name) continue;

    slots[name] = true;
  }

  return slots;
};
