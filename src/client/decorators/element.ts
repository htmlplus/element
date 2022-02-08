import { html, render } from 'uhtml';

import * as CONSTANTS from '../../configs/constants.js';
import { PlusElement } from '../../types/index.js';
import { isServer, parseValue } from '../utils/index.js';

export function Element(tag?: string) {
  return function (constructor: PlusElement) {
    if (isServer()) return;
    customElements.define(
      tag!,
      class extends HTMLElement {
        private plus;

        constructor() {
          super();

          this.plus = new Plus(constructor, this);

          this.attachShadow({ mode: 'open' });
        }

        static get observedAttributes() {
          const members = constructor[CONSTANTS.TOKEN_STATIC_MEMBERS];
          return Object.keys(members).filter((key) => members[key][0] != CONSTANTS.TYPE_FUNCTION);
        }

        adoptedCallback() {
          this.plus.adoptedCallback();
        }

        attributeChangedCallback(name, prev, next) {
          this.plus.attributeChangedCallback(name, prev, next);
        }

        connectedCallback() {
          this.plus.connectedCallback();
        }

        disconnectedCallback() {
          this.plus.disconnectedCallback();
        }
      }
    );
  };
}

class Plus {
  instance;

  states;

  isPending;

  updatePromise!: Promise<boolean>;

  constructor(private Class, private host) {
    // TODO
    this.instance = new (Class as any)();

    this.instance[CONSTANTS.TOKEN_API] ??= {};
    this.set(CONSTANTS.TOKEN_API_HOST, () => host);
    this.set(CONSTANTS.TOKEN_API_REQUEST, this.request.bind(this));

    // TODO
    this.instance.setup?.forEach((setup) => setup.bind(this.instance)());
  }

  adoptedCallback() {
    this.call(CONSTANTS.TOKEN_LIFECYCLE_ADOPTED);
  }

  attributeChangedCallback(name, prev, next) {
    const [type] = this.Class[CONSTANTS.TOKEN_STATIC_MEMBERS][name];
    this.instance[name] = parseValue(next, type);
    if (!this.get(CONSTANTS.TOKEN_API_READY)) return;
    this.request().catch((error) => {
      throw error;
    });
  }

  connectedCallback() {
    this.call(CONSTANTS.TOKEN_LIFECYCLE_CONNECTED);
    this.request()
      .then(() => this.call(CONSTANTS.TOKEN_LIFECYCLE_LOADED))
      .catch((error) => {
        throw error;
      });
    this.set(CONSTANTS.TOKEN_API_READY, true);
  }

  disconnectedCallback() {
    this.call(CONSTANTS.TOKEN_LIFECYCLE_DISCONNECTED);
  }

  call(key: string, args?: Array<any>) {
    return this.instance[key]?.apply(this.instance, args);
  }

  get(key: string) {
    return this.instance[CONSTANTS.TOKEN_API][key];
  }

  set(key: string, value: any) {
    this.instance[CONSTANTS.TOKEN_API][key] = value;
  }

  async enqueue(): Promise<boolean> {
    this.isPending = true;

    try {
      await this.updatePromise;
    } catch (error) {
      Promise.reject(error);
    }

    // TODO: may be not used
    if (!this.isPending) return this.updatePromise;

    try {
      if (!true /*shouldUpdate*/) return (this.isPending = false);

      console.log('render');

      // TODO
      // call(CONSTANTS.TOKEN_LIFECYCLE_UPDATE, [allStates]);

      render(this.host.shadowRoot, () => {
        const markup = this.call(CONSTANTS.TOKEN_METHOD_RENDER);

        const styles = this.Class[CONSTANTS.TOKEN_STATIC_STYLES];

        if (!styles && !markup) return html``;

        if (!styles) return markup;

        if (!markup) return html`<style>${styles}</style>`;

        return html`<style>${styles}</style>${markup}`;
      });

      // TODO
      this.call(CONSTANTS.TOKEN_LIFECYCLE_UPDATED, [this.states]);

      this.states = undefined;
      this.isPending = false;
      return true;
    } catch (error) {
      this.isPending = false;
      throw error;
    }
  }

  request(state?) {
    if (!true /*hasChange*/) return Promise.resolve(false);
    this.states = { ...(this.states || {}), ...state };
    if (!this.isPending) this.updatePromise = this.enqueue();
    return this.updatePromise;
  }
}
