import { html, render } from 'uhtml';

import * as CONSTANTS from '../../configs/constants.js';
import { isServer, parseValue, sync, updateAttribute } from '../utils/index.js';

// TODO: input type
export const proxy = (Class: any) => {
  if (isServer()) return class {};

  let instance, update;

  const members = Class[CONSTANTS.TOKEN_STATIC_MEMBERS] || {};

  const get = (key: string) => {
    return instance[CONSTANTS.TOKEN_API][key];
  };

  const set = (key: string, value: any) => {
    instance[CONSTANTS.TOKEN_API][key] = value;
  };

  return class extends HTMLElement {
    constructor() {
      super();

      instance = new Class();

      // TODO
      (instance.setup || []).map((fn) => fn.bind(instance)(this));

      instance[CONSTANTS.TOKEN_API] = instance[CONSTANTS.TOKEN_API] || {};

      set(CONSTANTS.TOKEN_API_READY, false);

      set(CONSTANTS.TOKEN_API_HOST, () => this);

      set(CONSTANTS.TOKEN_API_STATE, () => this.render());

      set(CONSTANTS.TOKEN_API_PROPERTY, (name, value, options: any = {}) => {
        const raw = this.getAttribute(name);

        const [type] = members[name];

        const parsed = parseValue(raw, type);

        if (parsed === value) return;

        if (options.reflect) updateAttribute(this, name, value);

        this.render();
      });

      this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
      return Object.keys(members).filter((key) => members[key][0] != CONSTANTS.TYPE_FUNCTION);
    }

    adoptedCallback() {
      instance[CONSTANTS.TOKEN_LIFECYCLE_ADOPTED].apply(instance);
    }

    attributeChangedCallback(name, prev, next) {
      const [type] = members[name];

      instance[name] = parseValue(next, type);

      if (!get(CONSTANTS.TOKEN_API_READY)) return;

      this.render();
    }

    connectedCallback() {
      update = sync(this, {});

      instance[CONSTANTS.TOKEN_LIFECYCLE_CONNECTED].apply(instance);

      this.render();

      instance[CONSTANTS.TOKEN_LIFECYCLE_LOADED].apply(instance);

      set(CONSTANTS.TOKEN_API_READY, true);
    }

    disconnectedCallback() {
      instance[CONSTANTS.TOKEN_LIFECYCLE_DISCONNECTED].apply(instance);
    }

    render() {
      if (isServer()) return;

      // TODO
      update(instance.attributes || {});

      render(this.shadowRoot as any, () => {
        const markup = instance[CONSTANTS.TOKEN_METHOD_RENDER].apply(instance);

        const styles = Class[CONSTANTS.TOKEN_STATIC_STYLES];

        if (!styles && !markup) return html``;

        if (!styles) return markup;

        if (!markup) return html`<style>${styles}</style>`;

        return html`<style>${styles}</style>${markup}`;
      });
    }
  };
};
