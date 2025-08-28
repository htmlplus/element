import type { HTMLPlusElement } from '@/types';

import { host } from './host';

const outsides: Array<{
	callback: EventListenerOrEventListenerObject;
	element: Window | Document | HTMLElement;
	handler: EventListenerOrEventListenerObject;
	options?: boolean | AddEventListenerOptions;
	type: string;
}> = [];

/**
 * TODO
 */
export const dispatch = <T = unknown>(
	target: HTMLElement | HTMLPlusElement,
	type: string,
	eventInitDict?: CustomEventInit<T>
): CustomEvent<T> => {
	const event = new CustomEvent<T>(type, eventInitDict);

	host(target).dispatchEvent(event);

	return event;
};

/**
 * TODO
 */
export const on = (
	target: Window | Document | HTMLElement | HTMLPlusElement,
	type: string,
	handler: EventListenerOrEventListenerObject,
	options?: boolean | AddEventListenerOptions
) => {
	const element = host(target as HTMLElement);

	if (type !== 'outside') {
		return element.addEventListener(type, handler, options);
	}

	const callback = (event) => {
		const has = event.composedPath().some((item) => item === element);

		if (has) return;

		if (typeof handler === 'function') {
			handler(event);
		} else {
			handler.handleEvent(event);
		}
	};

	type = 'ontouchstart' in window.document.documentElement ? 'touchstart' : 'click';

	on(document, type, callback, options);

	outsides.push({
		callback,
		element,
		handler,
		options,
		type
	});
};

/**
 * TODO
 */
export const off = (
	target: Window | Document | HTMLElement | HTMLPlusElement,
	type: string,
	handler: EventListenerOrEventListenerObject,
	options?: boolean | AddEventListenerOptions
): void => {
	const element = host(target as HTMLElement);

	if (type !== 'outside') {
		return void element.removeEventListener(type, handler, options);
	}

	const index = outsides.findIndex((outside) => {
		return (
			outside.element === element && outside.handler === handler && outside.options === options
		);
	});

	const outside = outsides[index];

	if (!outside) return;

	off(document, outside.type, outside.callback, outside.options);

	outsides.splice(index, 1);
};
