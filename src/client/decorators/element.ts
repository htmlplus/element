import { html, render } from 'uhtml';

import * as CONSTANTS from '../../configs/constants.js';
import { PlusElement } from '../../types/index.js';
import { api, call, task, isServer, parseValue } from '../utils/index.js';

export function Element(tag?: string) {
  return function (constructor: PlusElement) {
    if (isServer()) return;
    const members = constructor[CONSTANTS.STATIC_MEMBERS];
    const styles = constructor[CONSTANTS.STATIC_STYLES];
    class Plus extends HTMLElement {
      plus;

      constructor() {
        super();

        this.plus = new (constructor as any)();

        const { run } = task({
          canStart: (states, state) => {
            return /* hasChange */ true;
          },
          canRun: (states) => {
            return /* shouldUpdate */ true;
          },
          run: (states) => {
            call(this.plus, CONSTANTS.LIFECYCLE_UPDATE, states);
            render(this.shadowRoot!, () => {
              const markup = call(this.plus, CONSTANTS.METHOD_RENDER);
              if (!styles && !markup) return html``;
              if (!styles) return markup;
              if (!markup) return html`<style>${styles}</style>`;
              return html`<style>${styles}</style>${markup}`;
            });
            call(this.plus, CONSTANTS.LIFECYCLE_UPDATED, states);
          }
        });

        this.plus[CONSTANTS.API] ??= {
          [CONSTANTS.API_HOST]: () => this,
          [CONSTANTS.API_REQUEST]: run
        };

        this.plus.setup?.forEach((setup) => setup.call(this.plus));

        this.attachShadow({ mode: 'open' });
      }

      static get observedAttributes() {
        return Object.keys(members).filter((key) => members[key][0] != CONSTANTS.TYPE_FUNCTION);
      }

      adoptedCallback() {
        call(this.plus, CONSTANTS.LIFECYCLE_ADOPTED);
      }

      attributeChangedCallback(name, prev, next) {
        const [type] = members[name];
        this.plus[name] = parseValue(next, type);
        if (!api(this.plus).ready) return;
        api(this.plus)
          .request()
          .catch((error) => {
            throw error;
          });
      }

      connectedCallback() {
        call(this.plus, CONSTANTS.LIFECYCLE_CONNECTED);

        api(this.plus)
          .request()
          .then(() => {
            call(this.plus, CONSTANTS.LIFECYCLE_LOADED);
          })
          .catch((error) => {
            throw error;
          });

        this.plus[CONSTANTS.API][CONSTANTS.API_READY] = true;
      }

      disconnectedCallback() {
        call(this.plus, CONSTANTS.LIFECYCLE_DISCONNECTED);
      }
    }
    customElements.define(tag!, Plus);
  };
}
