import { kebabCase } from 'change-case';

export const updateAttribute = (node: Element, key: string, value: any): void => {
  const name = kebabCase(key);
  if ([undefined, null, false].includes(value)) return node.removeAttribute(name);
  node.setAttribute(name, value === true ? '' : value);
};
