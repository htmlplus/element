import { html, render } from 'uhtml';

import * as CONSTANTS from '../../configs/constants.js';
import { PlusElement } from '../../types/index.js';
import { isServer, parseValue } from '../utils/index.js';

export function Element(tag?: string) {
  return function (constructor: PlusElement) {
    if (isServer()) return;
    const members = constructor[CONSTANTS.TOKEN_STATIC_MEMBERS];
    const styles = constructor[CONSTANTS.TOKEN_STATIC_STYLES];
    customElements.define(
      tag!,
      class extends HTMLElement {
        plus;

        constructor() {
          super();

          // TODO
          this.plus = new (constructor as any)();

          // TODO
          let states, isPending, updatePromise!: Promise<boolean>;
          const request = (state?) => {
            if (!true /*hasChange*/) return Promise.resolve(false);
            states = { ...(states || {}), ...state };
            if (!isPending) updatePromise = enqueue();
            return updatePromise;
          };
          const enqueue = async (): Promise<boolean> => {
            isPending = true;

            try {
              await updatePromise;
            } catch (error) {
              Promise.reject(error);
            }

            // TODO: may be not used
            if (!isPending) return updatePromise;

            try {
              if (!true /*shouldUpdate*/) return (isPending = false);

              console.log('render');

              // TODO
              // call(CONSTANTS.TOKEN_LIFECYCLE_UPDATE, [allStates]);

              render(this.shadowRoot!, () => {
                const markup = this.plus[CONSTANTS.TOKEN_METHOD_RENDER]?.call(this.plus);
                if (!styles && !markup) return html``;
                if (!styles) return markup;
                if (!markup) return html`<style>${styles}</style>`;
                return html`<style>${styles}</style>${markup}`;
              });

              // TODO
              this.plus[CONSTANTS.TOKEN_LIFECYCLE_UPDATED]?.call(this.plus, states);

              states = undefined;

              isPending = false;

              return true;
            } catch (error) {
              isPending = false;
              throw error;
            }
          };

          this.plus[CONSTANTS.TOKEN_API] ??= {
            [CONSTANTS.TOKEN_API_HOST]: () => this,
            [CONSTANTS.TOKEN_API_REQUEST]: request
          };

          // TODO
          this.plus.setup?.forEach((setup) => setup.call(this.plus));

          this.attachShadow({ mode: 'open' });
        }

        static get observedAttributes() {
          return Object.keys(members).filter((key) => members[key][0] != CONSTANTS.TYPE_FUNCTION);
        }

        adoptedCallback() {
          this.plus[CONSTANTS.TOKEN_LIFECYCLE_ADOPTED]?.call(this.plus);
        }

        attributeChangedCallback(name, prev, next) {
          const [type] = members[name];
          this.plus[name] = parseValue(next, type);
          if (!this.plus[CONSTANTS.TOKEN_API][CONSTANTS.TOKEN_API_READY]) return;
          this.plus[CONSTANTS.TOKEN_API][CONSTANTS.TOKEN_API_REQUEST]().catch((error) => {
            throw error;
          });
        }

        connectedCallback() {
          this.plus[CONSTANTS.TOKEN_LIFECYCLE_CONNECTED]?.call(this.plus);
          this.plus[CONSTANTS.TOKEN_API]
            [CONSTANTS.TOKEN_API_REQUEST]()
            .then(() => {
              this.plus[CONSTANTS.TOKEN_LIFECYCLE_LOADED]?.call(this.plus);
            })
            .catch((error) => {
              throw error;
            });
          this.plus[CONSTANTS.TOKEN_API][CONSTANTS.TOKEN_API_READY] = true;
        }

        disconnectedCallback() {
          this.plus[CONSTANTS.TOKEN_LIFECYCLE_DISCONNECTED]?.call(this.plus);
        }
      }
    );
  };
}
