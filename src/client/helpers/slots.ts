import { host } from './host.js';

type Slots = {
  [key: string]: Array<Element> | undefined;
};

export const slots = (target): Slots => {
  const result = {};
  host(target)
    ?.shadowRoot?.querySelectorAll('slot')
    .forEach((slot) => {
      const name = slot.name || 'default';
      Object.defineProperty(result, name, {
        get() {
          const elements = slot.assignedElements();
          return elements.length ? elements : undefined;
        }
      });
    });
  return result;
};
