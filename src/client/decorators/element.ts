import { camelCase } from 'change-case';

import * as CONSTANTS from '../../constants/index.js';
import { HTMLPlusElement } from '../../types/index.js';
import { call, getConfig, getTag, isServer, request } from '../utils/index.js';

/**
 * The class marked with this decorator is considered a
 * [Custom Element](https://mdn.io/using-custom-elements),
 * and its name, in kebab-case, serves as the element name.
 */
export function Element() {
  return function (constructor: HTMLPlusElement) {
    if (isServer()) return;

    const tag = getTag(constructor)!;

    if (customElements.get(tag)) return;

    customElements.define(tag, proxy(constructor));
  };
}

const proxy = (constructor: HTMLPlusElement) => {
  return class Plus extends HTMLElement {
    static formAssociated = constructor['formAssociated'];

    static observedAttributes = constructor['observedAttributes'];

    constructor() {
      super();

      this.attachShadow({
        mode: 'open',
        delegatesFocus: constructor['delegatesFocus'],
        slotAssignment: constructor['slotAssignment']
      });

      const instance = (this[CONSTANTS.API_INSTANCE] = new (constructor as any)());

      instance[CONSTANTS.API_HOST] = () => this;

      call(instance, CONSTANTS.LIFECYCLE_CONSTRUCTED);
    }

    adoptedCallback() {
      call(this[CONSTANTS.API_INSTANCE], CONSTANTS.LIFECYCLE_ADOPTED);
    }

    attributeChangedCallback(key, prev, next) {
      // Ensures the integrity of readonly properties to prevent potential errors.
      try {
        const attribute = constructor[CONSTANTS.MAPPER]?.[key];

        const property = attribute || camelCase(key);

        this[property] = next;
      } catch {}
    }

    connectedCallback() {
      const instance = this[CONSTANTS.API_INSTANCE];

      // TODO: experimental for global config
      Object.assign(instance, getConfig('element', getTag(instance)!, 'property'));

      instance[CONSTANTS.API_CONNECTED] = true;

      const connect = () => {
        request(instance, undefined, undefined, () => {
          call(instance, CONSTANTS.LIFECYCLE_LOADED);
        });
      };

      const callback = call(instance, CONSTANTS.LIFECYCLE_CONNECTED);

      if (!callback?.then) return connect();

      callback.then(() => connect());
    }

    disconnectedCallback() {
      call(this[CONSTANTS.API_INSTANCE], CONSTANTS.LIFECYCLE_DISCONNECTED);
    }
  };
};
