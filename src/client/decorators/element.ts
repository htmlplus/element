import { camelCase } from 'change-case';

import * as CONSTANTS from '../../constants/index.js';
import { HTMLPlusElement } from '../../types';
import { call, getConfig, getTag, isServer, request } from '../utils/index.js';

/**
 * The class marked with this decorator is considered a
 * [Custom Element](https://mdn.io/using-custom-elements),
 * and its name, in kebab-case, serves as the element name.
 */
export function Element() {
  return function (constructor: HTMLPlusElement) {
    if (isServer()) return;

    const tag = getTag(constructor);

    if (customElements.get(tag!)) return;

    class Plus extends HTMLElement {
      // TODO
      static formAssociated = constructor['formAssociated'];

      // TODO
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

        // TODO
        call(instance, CONSTANTS.LIFECYCLE_CONSTRUCTED);
      }

      adoptedCallback() {
        call(this[CONSTANTS.API_INSTANCE], CONSTANTS.LIFECYCLE_ADOPTED);
      }

      attributeChangedCallback(attribute, prev, next) {
        // ensures the integrity of readonly properties to prevent potential errors.
        try {
          this[camelCase(attribute)] = next;
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
    }

    customElements.define(tag!, Plus);
  };
}
