import { paramCase } from 'change-case';

export const updateAttribute = (node: Element, key: string, value: any): void => {
  key = paramCase(key);
  if ([undefined, null, false].includes(value))
    return node.removeAttribute(key);
  node.setAttribute(key, value === true ? '' : value);
};
