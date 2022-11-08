import { PlusElement } from '../../types';
import { host } from '../utils/index.js';

type Slots = {
  [key: string]: boolean;
};

export const slots = (target: PlusElement): Slots => {
  const slots = {};

  const children = Array.from(host(target).childNodes);

  for (const child of children) {
    const name = child['slot'] || (child.nodeValue?.trim() && 'default');

    if (!name) continue;

    slots[name] = true;
  }

  return slots;
};
