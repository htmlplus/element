import { camelCase } from 'change-case';
import * as CONSTANTS from '../../constants/index.js';
import { call, getConfig, getTag, isServer, request } from '../utils/index.js';
/**
 * The class marked with this decorator is considered a
 * [Custom Element](https://mdn.io/using-custom-elements),
 * and its name, in kebab-case, serves as the element name.
 */
export function Element() {
    return function (constructor) {
        if (isServer())
            return;
        const tag = getTag(constructor);
        if (customElements.get(tag))
            return;
        class Plus extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({
                    mode: 'open',
                    delegatesFocus: constructor['delegatesFocus'],
                    slotAssignment: constructor['slotAssignment']
                });
                const instance = (this[CONSTANTS.API_INSTANCE] = new constructor());
                instance[CONSTANTS.API_HOST] = () => this;
                // TODO
                call(instance, CONSTANTS.LIFECYCLE_CONSTRUCTED);
            }
            adoptedCallback() {
                call(this[CONSTANTS.API_INSTANCE], CONSTANTS.LIFECYCLE_ADOPTED);
            }
            attributeChangedCallback(attribute, prev, next) {
                const instance = this[CONSTANTS.API_INSTANCE];
                if (instance[CONSTANTS.API_LOCKED])
                    return;
                const name = camelCase(attribute);
                // ensures the integrity of readonly properties to prevent potential errors.
                try {
                    this[name] = next;
                }
                catch (_a) { }
            }
            connectedCallback() {
                const instance = this[CONSTANTS.API_INSTANCE];
                // TODO: experimental for global config
                Object.assign(instance, getConfig('element', getTag(instance), 'property'));
                const connect = () => {
                    instance[CONSTANTS.API_CONNECTED] = true;
                    call(instance, CONSTANTS.LIFECYCLE_CONNECTED);
                    request(instance, undefined, undefined, () => {
                        call(instance, CONSTANTS.LIFECYCLE_LOADED);
                    });
                };
                const callback = call(instance, CONSTANTS.LIFECYCLE_CONNECT);
                if (!(callback === null || callback === void 0 ? void 0 : callback.then))
                    return connect();
                callback.then(() => connect());
            }
            disconnectedCallback() {
                call(this[CONSTANTS.API_INSTANCE], CONSTANTS.LIFECYCLE_DISCONNECTED);
            }
        }
        // TODO
        Plus.formAssociated = constructor['formAssociated'];
        // TODO
        Plus.observedAttributes = constructor['observedAttributes'];
        customElements.define(tag, Plus);
    };
}
