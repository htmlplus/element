import { kebabCase } from 'change-case';

import { HTMLPlusElement } from '../../types/index.js';
import { host } from './host.js';

export const updateAttribute = (
  target: HTMLElement | HTMLPlusElement,
  key: string,
  value: any
): void => {
  const element = host(target);

  const name = kebabCase(key);

  if ([undefined, null, false].includes(value)) {
    return element.removeAttribute(name);
  }

  element.setAttribute(name, value === true ? '' : value);
};
