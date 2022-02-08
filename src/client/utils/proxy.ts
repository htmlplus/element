import { html, render } from 'uhtml';

import * as CONSTANTS from '../../configs/constants.js';
import { PlusElement } from '../../types/index.js';
import { isServer } from './is-server.js';
import { parseValue } from './parse-value.js';

// TODO: input type
export const proxy = (Class: PlusElement) => {
  if (isServer()) return class { };

  let host, instance;

  const members = Class[CONSTANTS.TOKEN_STATIC_MEMBERS] || {};

  // TODO
  let states;
  let isPending = false;
  let updatePromise: Promise<boolean>;
  const request = (state?) => {
    if (!true /*hasChange*/) return Promise.resolve(false);
    states = { ...(states || {}), ...state };
    if (!isPending)
      updatePromise = enqueue();
    return updatePromise;
  };
  const enqueue = async (): Promise<boolean> => {
    isPending = true;

    try {
      await updatePromise;
    }
    catch (error) {
      Promise.reject(error);
    }

    // TODO: may be not used
    if (!isPending) return updatePromise;

    try {
      if (!true /*shouldUpdate*/) return isPending = false;

      console.log('render')

      // TODO
      // call(CONSTANTS.TOKEN_LIFECYCLE_UPDATE, [allStates]);

      render(host.shadowRoot, () => {
        const markup = call(CONSTANTS.TOKEN_METHOD_RENDER);

        const styles = Class[CONSTANTS.TOKEN_STATIC_STYLES];

        if (!styles && !markup) return html``;

        if (!styles) return markup;

        if (!markup) return html`<style>${styles}</style>`;

        return html`<style>${styles}</style>${markup}`;
      });

      // TODO
      call(CONSTANTS.TOKEN_LIFECYCLE_UPDATED, [states]);

      states = undefined;
      isPending = false;
      return true
    }
    catch (error) {
      isPending = false;
      throw error;
    }
  };

  const call = (key: string, args?: Array<any>) => {
    return instance[key]?.apply(instance, args);
  };

  const get = (key: string) => {
    return instance[CONSTANTS.TOKEN_API][key];
  };

  const set = (key: string, value: any) => {
    instance[CONSTANTS.TOKEN_API][key] = value;
  };

  return class extends HTMLElement {
    constructor() {
      super();

      host = this;

      // TODO
      instance = new (Class as any)();

      instance[CONSTANTS.TOKEN_API] ??= {};
      set(CONSTANTS.TOKEN_API_HOST, () => host);
      set(CONSTANTS.TOKEN_API_REQUEST, request);

      // TODO
      instance.setup?.forEach((setup) => setup.bind(instance)());

      this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
      return Object.keys(members).filter((key) => members[key][0] != CONSTANTS.TYPE_FUNCTION);
    }

    adoptedCallback() {
      call(CONSTANTS.TOKEN_LIFECYCLE_ADOPTED);
    }

    attributeChangedCallback(name, prev, next) {
      const [type] = members[name];
      instance[name] = parseValue(next, type);
      if (!get(CONSTANTS.TOKEN_API_READY)) return;
      request().catch((error) => { throw error });
    }

    connectedCallback() {
      call(CONSTANTS.TOKEN_LIFECYCLE_CONNECTED);
      request().then(() => call(CONSTANTS.TOKEN_LIFECYCLE_LOADED)).catch((error) => { throw error });
      set(CONSTANTS.TOKEN_API_READY, true);
    }

    disconnectedCallback() {
      call(CONSTANTS.TOKEN_LIFECYCLE_DISCONNECTED);
    }
  };
};
