import { html, render } from 'uhtml';
import * as CONSTANTS from '../../configs/constants.js';
import { isServer } from '../../utils/is-server.js';
import { sync } from '../../utils/sync.js';
import { toBoolean } from '../../utils/to-boolean.js';
import { updateAttribute } from '../../utils/update-attribute.js';

export { html, render } from 'uhtml';

// TODO: input type
export const define = (name: string, Class: any) => {

  if (isServer()) return;

  customElements.define(name, Class);
};

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
  }

  const getApi = (key: string) => {
    return instance[CONSTANTS.TOKEN_API][key];
  };

  const setApi = (key: string, value: any) => {
    instance[CONSTANTS.TOKEN_API][key] = value;
  };

  const getValue = (key, value) => {

    const [type] = members[key];

    switch (type) {

      case CONSTANTS.TYPE_BOOLEAN:
        return toBoolean(value);

      case CONSTANTS.TYPE_NUMBER:
        return parseFloat(value);

      default:
        return value;
    }
  }

  return class extends HTMLElement {

    constructor() {

      super();

      instance = new Class();

      instance[CONSTANTS.TOKEN_API] = instance[CONSTANTS.TOKEN_API] || {};

      setApi(CONSTANTS.TOKEN_API_READY, false);

      setApi(CONSTANTS.TOKEN_API_HOST, () => this);

      setApi(CONSTANTS.TOKEN_API_STATE, () => this.render());

      setApi(
        CONSTANTS.TOKEN_API_PROPERTY,
        (name, value, options: any = {}) => {

          const raw = this.getAttribute(name);

          const parsed = getValue(name, raw);

          if (parsed === value) return;

          if (options.reflect)
            updateAttribute(this, name, value);

          this.render();
        }
      );

      Object
        .keys(members)
        .map((key) => {

          const [type] = members[key];

          let get: any = () => instance[key];

          let set: any = (value) => instance[key] = value;

          if (type === CONSTANTS.TYPE_FUNCTION) {

            get = () => instance[key].bind(instance);

            set = undefined;
          }

          Object.defineProperty(this, key, { get, set })
        })

      this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
      return Object
        .keys(members)
        .filter((key) => members[key][0] != CONSTANTS.TYPE_FUNCTION)
    }

    adoptedCallback() { }

    attributeChangedCallback(name, prev, next) {

      instance[name] = getValue(name, next);

      if (!getApi(CONSTANTS.TOKEN_API_READY)) return;

      this.render();
    }

    connectedCallback() {

      update = sync(this, {});

      call(CONSTANTS.TOKEN_LIFECYCLE_CONNECTED);

      this.render();

      call(CONSTANTS.TOKEN_LIFECYCLE_LOADED);

      setApi(CONSTANTS.TOKEN_API_READY, true);
    }

    disconnectedCallback() {
      call(CONSTANTS.TOKEN_LIFECYCLE_DISCONNECTED);
    }

    render() {

      // TODO
      update(instance.attributes || {});

      render(
        this.shadowRoot as any,
        () => {

          const markup = call(CONSTANTS.TOKEN_METHOD_RENDER);

          if (!markup && !styles) return html``;

          if (!markup) return html`<style>${styles}</style>`;

          if (!styles) return markup;

          return html`<style>${styles}</style>${markup}`;
        }
      )
    }
  }
}