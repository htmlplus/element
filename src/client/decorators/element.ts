import * as CONSTANTS from '../../constants/index.js';
import { HTMLPlusElement } from '../../types/index.js';
import { call, getConfig, getTag, isServer, requestUpdate } from '../utils/index.js';

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
    #instance;

    static formAssociated = constructor['formAssociated'];

    static observedAttributes = constructor['observedAttributes'];

    constructor() {
      super();

      this.attachShadow({
        mode: 'open',
        delegatesFocus: constructor['delegatesFocus'],
        slotAssignment: constructor['slotAssignment']
      });

      this.#instance = new (constructor as any)();

      this.#instance[CONSTANTS.API_HOST] = () => this;

      call(this.#instance, CONSTANTS.LIFECYCLE_CONSTRUCTED);
    }

    adoptedCallback() {
      call(this.#instance, CONSTANTS.LIFECYCLE_ADOPTED);
    }

    attributeChangedCallback(key, prev, next) {
      if (prev != next) {
        this.#instance['RAW:' + key] = next;
      }
    }

    connectedCallback() {
      // TODO: experimental for global config
      Object.assign(this.#instance, getConfig('element', getTag(this.#instance)!, 'property'));

      this.#instance[CONSTANTS.API_CONNECTED] = true;

      call(this.#instance, CONSTANTS.LIFECYCLE_CONNECTED);

      requestUpdate(this.#instance, undefined, undefined, () => {
        call(this.#instance, CONSTANTS.LIFECYCLE_READY);
      });
    }

    disconnectedCallback() {
      call(this.#instance, CONSTANTS.LIFECYCLE_DISCONNECTED);
    }
  };
};
