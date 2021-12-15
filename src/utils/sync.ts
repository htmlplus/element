import { getEventName } from './get-event-name.js';
import { isEvent } from './is-event.js';
import { updateAttribute } from './update-attribute.js';

// TODO
export const sync = (node: any, prev: any) => (next: any = {}) => {

    const prevClass = (prev.class || '').split(' ');
    const nextClass = (next.class || '').split(' ');

    const newClass = (node.className || '')
        .split(' ')
        .filter((key) => !prevClass.includes(key) && !nextClass.includes(key))
        .concat(nextClass)
        .filter((key) => key)
        .join(' ');

    updateAttribute(node, 'class', newClass || undefined);

    if (prev.style || next.style)
        node.setAttribute('style', next.style || '');

    for (const key in prev) {

        const value = prev[key];

        if (!isEvent(key)) continue;

        const name = getEventName(key);

        node.removeEventListener(name, value);
    }

    for (const key in next) {

        const value = next[key];

        if (['class', 'style'].includes(key)) continue;

        if (isEvent(key)) {

            const name = getEventName(key);

            node.addEventListener(name, value);

            continue;
        }

        updateAttribute(node, key, value);
    }

    prev = { ...next };
};