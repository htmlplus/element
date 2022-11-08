import { camelCase, paramCase } from 'change-case';

import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types';
import { call, getMembers, isServer, parseValue, request } from '../utils/index.js';

export function Element(tag?: string) {
  return function (constructor: PlusElement) {
    if (isServer()) return;

    if (customElements.get(tag!)) return;

    class Plus extends HTMLElement {
      constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        this[CONSTANTS.API_INSTANCE] = new (constructor as any)();

        this[CONSTANTS.API_INSTANCE][CONSTANTS.API_HOST] = () => this;
      }

      // TODO: ignore functions
      static get observedAttributes() {
        return Object.keys(getMembers(constructor)).map((key) => paramCase(key));
      }

      adoptedCallback() {
        call(this[CONSTANTS.API_INSTANCE], CONSTANTS.LIFECYCLE_ADOPTED);
      }

      attributeChangedCallback(attribute, prev, next) {
        const instance = this[CONSTANTS.API_INSTANCE];

        if (instance[CONSTANTS.API_LOCKED]) return;

        const name = camelCase(attribute);

        const type = getMembers(instance)[name]?.type;

        const value = parseValue(next, type);

        if (instance[name] === value) return;

        instance[name] = value;
      }

      connectedCallback() {
        const instance = this[CONSTANTS.API_INSTANCE];

        instance[CONSTANTS.API_CONNECTED] = true;

        call(instance, CONSTANTS.LIFECYCLE_CONNECTED);

        request(instance, undefined, undefined, () => {
          call(instance, CONSTANTS.LIFECYCLE_LOADED);
        });
      }

      disconnectedCallback() {
        call(this[CONSTANTS.API_INSTANCE], CONSTANTS.LIFECYCLE_DISCONNECTED);
      }
    }

    customElements.define(tag!, Plus);
  };
}
