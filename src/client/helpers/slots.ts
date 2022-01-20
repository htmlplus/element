import { defineProperty } from '../utils/index.js';
import { queryAll } from './query-all.js';

type Slots = {
  [key: string]: boolean;
};

export const slots = (target): Slots => {
  const result = {};
  queryAll(target, 'slot')?.forEach((slot) => {
    const name = slot.name || 'default';
    defineProperty(result, name, {
      get() {
        return !!slot.assignedNodes().filter((node) => node.nodeName != '#text' || node.nodeValue?.trim()).length;
      }
    });
  });
  return result;
};
