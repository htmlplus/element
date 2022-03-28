import * as CONSTANTS from '../../configs/constants.js';
import { PlusElement } from '../../types/index.js';
import { call, isServer, parseValue, request } from '../utils/index.js';

export function Element(tag?: string) {
  return function (constructor: PlusElement) {
    if (isServer()) return;
    const members = constructor[CONSTANTS.STATIC_MEMBERS];
    console.log(111, { constructor });

    class Plus extends HTMLElement {
      plus;

      constructor() {
        super();

        this.plus = new (constructor as any)();

        this.plus[CONSTANTS.API_HOST] = () => this;

        this.plus[CONSTANTS.API_SETUP]?.forEach((setup) => setup.call(this.plus));

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
        const parsed = parseValue(next, type);
        this.plus[name] = parsed;
      }

      connectedCallback() {
        this.plus[CONSTANTS.API_READY] = true;
        call(this.plus, CONSTANTS.LIFECYCLE_CONNECTED);
        request(this.plus)
          .then(() => {
            call(this.plus, CONSTANTS.LIFECYCLE_LOADED);
          })
          .catch((error) => {
            throw error;
          });
      }

      disconnectedCallback() {
        call(this.plus, CONSTANTS.LIFECYCLE_DISCONNECTED);
      }
    }
    customElements.define(tag!, Plus);
  };
}
