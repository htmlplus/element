import { isServer } from './is-server.js';

// TODO: Class type
export const define = (name: string, Class: any): void => {
  if (isServer()) return;
  window.customElements.define(name, Class);
};
