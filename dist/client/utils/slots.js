import { host } from './host.js';
/**
 * Returns the slots name.
 */
export const slots = (target) => {
    const element = host(target);
    const slots = {};
    const children = Array.from(element.childNodes);
    for (const child of children) {
        if (child.nodeName == '#comment')
            continue;
        const name = child['slot'] || (child.nodeValue?.trim() && 'default') || ('slot' in child && 'default');
        if (!name)
            continue;
        slots[name] = true;
    }
    return slots;
};
