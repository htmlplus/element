import { camelCase, paramCase } from 'change-case';

import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types';
import { call, fromAttribute, getMembers, isServer, request } from '../utils/index.js';

export function Element(tag?: string) {
  return function (constructor: PlusElement) {
    if (isServer()) return;

    if (customElements.get(tag!)) return;

    const members = getMembers(constructor);

    class Plus extends HTMLElement {
      constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        this[CONSTANTS.API_INSTANCE] = new (constructor as any)();

        Object.keys(members)
          .filter((key) => members[key].type != CONSTANTS.TYPE_FUNCTION)
          .forEach((key) => {
            members[key].default = this[CONSTANTS.API_INSTANCE][key];
          });

        this[CONSTANTS.API_INSTANCE][CONSTANTS.API_HOST] = () => this;
      }

      static get observedAttributes() {
        return Object.keys(members)
          .filter((key) => members[key].type != CONSTANTS.TYPE_FUNCTION)
          .map((key) => paramCase(key));
      }

      adoptedCallback() {
        call(this[CONSTANTS.API_INSTANCE], CONSTANTS.LIFECYCLE_ADOPTED);
      }

      attributeChangedCallback(attribute, prev, next) {
        const instance = this[CONSTANTS.API_INSTANCE];

        if (instance[CONSTANTS.API_LOCKED]) return;

        const name = camelCase(attribute);

        const type = members[name]?.type;

        const value = fromAttribute(next, type);

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
