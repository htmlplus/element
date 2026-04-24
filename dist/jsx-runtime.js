import { Fragment as Fragment$1, createElement as createElement$1 } from 'preact';
import 'change-case';
import { host } from './client.js';
import './constants.js';

// biome-ignore-all lint: TODO
const LISTENERS = Symbol();
function createElement(type, props, key) {
    const { children, value: instance, ...rest } = props || {};
    if (type !== 'host') {
        return createElement$1(type, props, ...[children].flat(1));
    }
    if (!instance) {
        throw new Error('host tag requires `value` prop');
    }
    const element = host(instance);
    for (const key in rest) {
        const value = rest[key];
        if (key === 'className') {
            element.className = value;
        }
        else if (key === 'style') {
            if (typeof value === 'string') {
                element.style = value;
            }
            else {
                for (const key in value) {
                    if (key.startsWith('--')) {
                        element.style.setProperty(key, value[key]);
                    }
                    else {
                        element.style[key] = value[key];
                    }
                }
            }
        }
        else if (key.startsWith('on')) {
            const listeners = (element[LISTENERS] ||= {});
            const event = key.slice(2).toLowerCase();
            listeners[event]?.();
            element.addEventListener(event, value);
            listeners[event] = () => {
                element.removeEventListener(event, value);
            };
        }
        else {
            element.setAttribute(key, value);
        }
    }
    return createElement(Fragment, { children, ...rest });
}
const Fragment = Fragment$1;
function jsx(type, props, key) {
    return createElement(type, props);
}
function jsxs(type, props, key) {
    return createElement(type, props);
}
function jsxDEV(type, props, key, isStatic, source, self) {
    props ||= {};
    if (source) {
        props.__source = source;
    }
    if (self) {
        props.__self = self;
    }
    return createElement(type, props);
}
// TODO
// import { kebabCase } from 'change-case';
// import type { HTMLPlusElement } from '@/types';
// import { off, on } from './event';
// import { host } from './host';
// import { isEvent } from './isEvent';
// import { toEvent } from './toEvent';
// import { updateAttribute } from './updateAttribute';
// const symbol = Symbol();
// export const attributes = (target: HTMLElement | HTMLPlusElement, attributes: unknown[]): void => {
// 	const element = host(target);
// 	const prev = element[symbol] || {};
// 	const next = Object.assign({}, ...attributes);
// 	const prevClass = (prev.class || '').split(' ');
// 	const nextClass = (next.class || '').split(' ');
// 	const newClass = element.className
// 		.split(' ')
// 		.filter((key) => !prevClass.includes(key) && !nextClass.includes(key))
// 		.concat(nextClass)
// 		.filter((key) => key)
// 		.join(' ');
// 	updateAttribute(element, 'class', newClass || undefined);
// 	if (prev.style || next.style) element.setAttribute('style', next.style || '');
// 	// for (const key in prev) isEvent(key) && off(element, toEvent(key), prev[key]);
// 	for (const key in next) {
// 		if (['class', 'style'].includes(key)) continue;
// 		if (isEvent(key)) on(element, toEvent(key), next[key]);
// 		else updateAttribute(element, kebabCase(key), next[key]);
// 	}
// 	element[symbol] = { ...next };
// };
//  import type { HTMLPlusElement } from '@/types';
// import { host } from './host';
// export const updateAttribute = (
// 	target: HTMLElement | HTMLPlusElement,
// 	key: string,
// 	value: unknown
// ): void => {
// 	const element = host(target);
// 	if (value === undefined || value === null || value === false) {
// 		return void element.removeAttribute(key);
// 	}
// 	element.setAttribute(key, value === true ? '' : String(value));
// };

export { Fragment, jsx, jsxDEV, jsxs };
