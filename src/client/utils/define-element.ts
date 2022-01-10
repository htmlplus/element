import { isServer } from './is-server.js';

// TODO: Class type
export const defineElement = (name: string, Class: any): void => {
  if (isServer()) return;
  window.customElements.define(name, Class);
};
