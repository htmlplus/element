import { host } from './host.js';
/**
 * Returns the slots name.
 */
export const slots = (target) => {
    var _a;
    const slots = {};
    const children = Array.from(host(target).childNodes);
    for (const child of children) {
        if (child.nodeName == '#comment')
            continue;
        const name = child['slot'] || (((_a = child.nodeValue) === null || _a === void 0 ? void 0 : _a.trim()) && 'default') || ('slot' in child && 'default');
        if (!name)
            continue;
        slots[name] = true;
    }
    return slots;
};
