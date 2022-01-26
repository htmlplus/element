import { html, render } from 'uhtml';

import * as CONSTANTS from '../../configs/constants.js';
import { PlusElement } from '../../types/index.js';
import { isServer } from './is-server.js';
import { parseValue } from './parse-value.js';

// TODO: input type
export const proxy = (Class: PlusElement) => {
  if (isServer()) return class {};

  let host, instance;

  const members = Class[CONSTANTS.TOKEN_STATIC_MEMBERS] || {};

  const call = (key: string) => {
    return instance[key]?.apply(instance);
  };

  const get = (key: string) => {
    return instance[CONSTANTS.TOKEN_API][key];
  };

  const set = (key: string, value: any) => {
    instance[CONSTANTS.TOKEN_API][key] = value;
  };

  const request = (/*force?: boolean*/) => {
    // TODO
    instance[CONSTANTS.TOKEN_LIFECYCLE_UPDATE]?.();

    render(host.shadowRoot, () => {
      const markup = call(CONSTANTS.TOKEN_METHOD_RENDER);

      const styles = Class[CONSTANTS.TOKEN_STATIC_STYLES];

      if (!styles && !markup) return html``;

      if (!styles) return markup;

      if (!markup) return html`<style>${styles}</style>`;

      return html`<style>${styles}</style>${markup}`;
    });
  };

  return class extends HTMLElement {
    constructor() {
      super();

      host = this;

      // TODO
      instance = new (Class as any)();

      // TODO
      instance.setup?.map((fn) => fn.bind(instance)());

      instance[CONSTANTS.TOKEN_API] ??= {};
      set(CONSTANTS.TOKEN_API_HOST, () => this);
      set(CONSTANTS.TOKEN_API_REQUEST, request);

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
      request();
    }

    connectedCallback() {
      call(CONSTANTS.TOKEN_LIFECYCLE_CONNECTED);
      request();
      call(CONSTANTS.TOKEN_LIFECYCLE_LOADED);
      set(CONSTANTS.TOKEN_API_READY, true);
    }

    disconnectedCallback() {
      call(CONSTANTS.TOKEN_LIFECYCLE_DISCONNECTED);
    }
  };
};
