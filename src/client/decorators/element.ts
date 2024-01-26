import { camelCase, kebabCase } from 'change-case';

import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types';
import { call, getConfig, getMembers, getTag, isServer, request, toProperty } from '../utils/index.js';

/**
 * The class marked with this decorator is considered a
 * [Custom Element](https://mdn.io/using-custom-elements),
 * and its name, in kebab-case, serves as the element name.
 */
export function Element() {
  return function (constructor: PlusElement) {
    if (isServer()) return;

    const tag = getTag(constructor);

    if (customElements.get(tag!)) return;

    const members = getMembers(constructor);

    class Plus extends HTMLElement {
      constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        const instance = (this[CONSTANTS.API_INSTANCE] = new (constructor as any)());

        Object.keys(members).forEach((key) => {
          if (members[key].type != CONSTANTS.TYPE_FUNCTION) {
            members[key].default = instance[key];
          }
        });

        instance[CONSTANTS.API_HOST] = () => this;

        // TODO
        call(instance, CONSTANTS.LIFECYCLE_CONSTRUCTED);
      }

      static get observedAttributes() {
        return Object.keys(members)
          .filter((key) => members[key].type != CONSTANTS.TYPE_FUNCTION)
          .map((key) => kebabCase(key));
      }

      adoptedCallback() {
        call(this[CONSTANTS.API_INSTANCE], CONSTANTS.LIFECYCLE_ADOPTED);
      }

      attributeChangedCallback(attribute, prev, next) {
        const instance = this[CONSTANTS.API_INSTANCE];

        if (instance[CONSTANTS.API_LOCKED]) return;

        const name = camelCase(attribute);

        const type = members[name]?.type;

        const value = toProperty(next, type);

        if (instance[name] === value) return;

        instance[name] = value;
      }

      connectedCallback() {
        const instance = this[CONSTANTS.API_INSTANCE];

        // TODO: experimental for global config
        Object.assign(instance, getConfig('element', getTag(instance)!, 'property'));

        const connect = () => {
          instance[CONSTANTS.API_CONNECTED] = true;

          call(instance, CONSTANTS.LIFECYCLE_CONNECTED);

          request(instance, undefined, undefined, () => {
            call(instance, CONSTANTS.LIFECYCLE_LOADED);
          });
        };

        const callback = call(instance, CONSTANTS.LIFECYCLE_CONNECT);

        if (!callback?.then) return connect();

        callback.then(() => connect());
      }

      disconnectedCallback() {
        call(this[CONSTANTS.API_INSTANCE], CONSTANTS.LIFECYCLE_DISCONNECTED);
      }
    }

    customElements.define(tag!, Plus);
  };
}
