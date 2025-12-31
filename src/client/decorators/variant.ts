import * as CONSTANTS from '@/constants';
import type { HTMLPlusElement } from '@/types';

import { getConfig, getNamespace, getTag, wrapMethod } from '../utils';

export function Variant() {
	return (target: HTMLPlusElement, key: string) => {
		wrapMethod(
			'after',
			target,
			CONSTANTS.LIFECYCLE_UPDATE,
			function (states: Map<string, unknown>) {
				if (!states.has(key)) return;

				const namespace = getNamespace(target) || '';

				const tag = getTag(this) || '';

				const properties = getConfig(namespace).elements?.[tag]?.variants?.[this[key]]?.properties;

				if (!properties) return;

				const defaults = Object.assign({}, this[CONSTANTS.API_DEFAULTS], properties);

				delete defaults[key];

				Object.assign(this, defaults);
			}
		);
	};
}
