import * as CONSTANTS from '@/constants';
import type { HTMLPlusElement } from '@/types';

import { call, getConfig, getNamespace, getTag, isServer, requestUpdate } from '../utils';

/**
 * The class marked with this decorator is considered a
 * [Custom Element](https://mdn.io/using-custom-elements),
 * and its name, in kebab-case, serves as the element name.
 */
export function Element() {
	// biome-ignore lint: TODO
	return (constructor: HTMLPlusElement) => {
		if (isServer()) return;

		const tag = getTag(constructor);

		if (!tag) return;

		if (customElements.get(tag)) return;

		customElements.define(tag, proxy(constructor));
	};
}

// biome-ignore lint: TODO
const proxy = (constructor: HTMLPlusElement) => {
	return class Plus extends HTMLElement {
		#instance;

		// biome-ignore lint: TODO
		static formAssociated = constructor['formAssociated'];

		// biome-ignore lint: TODO
		static observedAttributes = constructor['observedAttributes'];

		constructor() {
			super();

			this.attachShadow({
				mode: 'open',
				// biome-ignore lint: TODO
				delegatesFocus: constructor['delegatesFocus'],
				// biome-ignore lint: TODO
				slotAssignment: constructor['slotAssignment']
			});

			// biome-ignore lint: TODO
			this.#instance = new (constructor as any)();

			this.#instance[CONSTANTS.API_HOST] = () => this;

			call(this.#instance, CONSTANTS.LIFECYCLE_CONSTRUCTED);
		}

		adoptedCallback() {
			call(this.#instance, CONSTANTS.LIFECYCLE_ADOPTED);
		}

		attributeChangedCallback(key, prev, next) {
			if (prev !== next) {
				this.#instance[`RAW:${key}`] = next;
			}
		}

		connectedCallback() {
			// TODO: experimental for global config
			(() => {
				const namespace = getNamespace(this.#instance) || '';

				const tag = getTag(this.#instance) || '';

				const properties = getConfig(namespace).elements?.[tag]?.properties;

				if (!properties) return;

				const defaults = Object.fromEntries(
					Object.entries(properties).map(([key, value]) => [
						key,
						(value as { default: unknown })?.default
					])
				);

				Object.assign(this, defaults);
			})();

			// TODO
			(() => {
				const key = Object.keys(this).find((key) => key.startsWith('__reactProps'));

				const props = this[key as keyof Element];

				if (!props) return;

				for (const [key, value] of Object.entries(props)) {
					if (this[key] !== undefined) continue;

					if (key === 'children') continue;

					if (typeof value !== 'object') continue;

					this[key] = value;
				}
			})();

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
