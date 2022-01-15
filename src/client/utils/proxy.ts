import { html, render } from 'uhtml';
import * as CONSTANTS from '../../configs/constants.js';
import { isServer, parseValue, sync, updateAttribute } from '../utils/index.js';

// TODO: input type
export const proxy = (Class: any) => {
  if (isServer()) return class { };

  let instance, update;

  const members = Class[CONSTANTS.TOKEN_STATIC_MEMBERS] || {};

  const styles = Class[CONSTANTS.TOKEN_STATIC_STYLES];

  const call = (key: string) => {
    const fn = instance[key];

    if (!fn) return;

    return fn.apply(instance);
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
      call(CONSTANTS.TOKEN_LIFECYCLE_ADOPTED);
    }

    attributeChangedCallback(name, prev, next) {
      const [type] = members[name];

      instance[name] = parseValue(next, type);

      if (!get(CONSTANTS.TOKEN_API_READY)) return;

      this.render();
    }

    connectedCallback() {
      update = sync(this, {});

      call(CONSTANTS.TOKEN_LIFECYCLE_CONNECTED);

      this.render();

      call(CONSTANTS.TOKEN_LIFECYCLE_LOADED);

      set(CONSTANTS.TOKEN_API_READY, true);
    }

    disconnectedCallback() {
      call(CONSTANTS.TOKEN_LIFECYCLE_DISCONNECTED);
    }

    render() {
      if (isServer()) return;

      // TODO
      update(instance.attributes || {});

      render(this.shadowRoot as any, () => {
        const markup = call(CONSTANTS.TOKEN_METHOD_RENDER);

        if (!markup && !styles) return html``;

        if (!markup)
          return html`<style>
            ${styles}
          </style>`;

        if (!styles) return markup;

        return html`<style>
            ${styles}</style
          >${markup}`;
      });
    }
  };
};
