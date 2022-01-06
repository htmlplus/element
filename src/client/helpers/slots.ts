import { host } from './host.js';

type Slots = {
  [key: string]: Array<Element> | undefined;
};

export const slots = (target): Slots => {
  const result = {};
  host(target)
    ?.shadowRoot?.querySelectorAll('slot')
    .forEach((slot) => {
      const elements = slot.assignedElements();
      if (!elements.length) return;
      result[slot.name || 'default'] = elements;
    });
  return result;
};
