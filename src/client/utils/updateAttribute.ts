import { HTMLPlusElement } from '../../types/index.js';
import { host } from './host.js';

export const updateAttribute = (
  target: HTMLElement | HTMLPlusElement,
  key: string,
  value: any
): void => {
  const element = host(target);

  if ([undefined, null, false].includes(value)) {
    element.removeAttribute(key);
  } else {
    element.setAttribute(key, value === true ? '' : value);
  }
};
