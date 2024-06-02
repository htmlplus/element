import { HTMLPlusElement } from '../../types/index.js';
import { off, on } from './event.js';
import { host } from './host.js';
import { isEvent } from './isEvent.js';
import { toEvent } from './toEvent.js';
import { updateAttribute } from './updateAttribute.js';

const symbol = Symbol();

export const attributes = (target: HTMLElement | HTMLPlusElement, attributes: any[]): void => {
  const element = host(target);

  const prev = element[symbol] || {};
  const next = Object.assign({}, ...attributes);

  const prevClass = (prev.class || '').split(' ');
  const nextClass = (next.class || '').split(' ');

  const newClass = element.className
    .split(' ')
    .filter((key) => !prevClass.includes(key) && !nextClass.includes(key))
    .concat(nextClass)
    .filter((key) => key)
    .join(' ');

  updateAttribute(element, 'class', newClass || undefined);

  if (prev.style || next.style) element.setAttribute('style', next.style || '');

  for (const key in prev) isEvent(key) && off(element, toEvent(key), prev[key]);

  for (const key in next) {
    if (['class', 'style'].includes(key)) continue;
    if (isEvent(key)) on(element, toEvent(key), next[key]);
    else updateAttribute(element, key, next[key]);
  }

  element[symbol] = { ...next };
};
