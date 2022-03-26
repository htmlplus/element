import { html, render } from 'uhtml';

import * as CONSTANTS from '../../configs/constants.js';
import { PlusElement } from '../../types/index.js';
import { api, task, isServer, parseValue } from '../utils/index.js';

export function Element(tag?: string) {
  return function (constructor: PlusElement) {
    if (isServer()) return;
    const members = constructor[CONSTANTS.STATIC_MEMBERS];
    const styles = constructor[CONSTANTS.STATIC_STYLES];
    class Plus extends HTMLElement {
      plus;

      constructor() {
        super();

        // TODO
        this.plus = new (constructor as any)();

        // TODO
        const { run } = task({
          canStart: (states, state) => {
            return /* hasChange */ true;
          },
          canRun: (states) => {
            return /* shouldUpdate */ true;
          },
          run: (states) => {
            // TODO
            // call(CONSTANTS.TOKEN_LIFECYCLE_UPDATE, [allStates]);

            render(this.shadowRoot!, () => {
              const markup = this.plus[CONSTANTS.METHOD_RENDER]?.call(this.plus);
              if (!styles && !markup) return html``;
              if (!styles) return markup;
              if (!markup) return html`<style>${styles}</style>`;
              return html`<style>${styles}</style>${markup}`;
            });

            // TODO
            this.plus[CONSTANTS.LIFECYCLE_UPDATED]?.call(this.plus, states);
          }
        });

        this.plus[CONSTANTS.API] ??= {
          [CONSTANTS.API_HOST]: () => this,
          [CONSTANTS.API_REQUEST]: run
        };

        // TODO
        this.plus.setup?.forEach((setup) => setup.call(this.plus));

        this.attachShadow({ mode: 'open' });
      }

      static get observedAttributes() {
        return Object.keys(members).filter((key) => members[key][0] != CONSTANTS.TYPE_FUNCTION);
      }

      adoptedCallback() {
        this.plus[CONSTANTS.LIFECYCLE_ADOPTED]?.call(this.plus);
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
        this.plus[CONSTANTS.LIFECYCLE_CONNECTED]?.call(this.plus);

        api(this.plus)
          .request()
          .then(() => {
            this.plus[CONSTANTS.LIFECYCLE_LOADED]?.call(this.plus);
          })
          .catch((error) => {
            throw error;
          });

        this.plus[CONSTANTS.API][CONSTANTS.API_READY] = true;
      }

      disconnectedCallback() {
        this.plus[CONSTANTS.LIFECYCLE_DISCONNECTED]?.call(this.plus);
      }
    }
    customElements.define(tag!, Plus);
  };
}
