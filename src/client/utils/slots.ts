import { PlusElement } from '../../types';
import { host } from './host.js';

type Slots = {
  [key: string]: boolean;
};

/**
 * Returns the slots name.
 */
export const slots = (target: PlusElement): Slots => {
  const slots = {};

  const children = Array.from(host(target).childNodes);

  for (const child of children) {
    if (child.nodeName == '#comment') continue;

    const name =
      child['slot'] || (child.nodeValue?.trim() && 'default') || ('slot' in child && 'default');

    if (!name) continue;

    slots[name] = true;
  }

  return slots;
};
