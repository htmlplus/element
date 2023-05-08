import { host } from './host.js';
export const slots = (target) => {
    var _a;
    const slots = {};
    const children = Array.from(host(target).childNodes);
    for (const child of children) {
        const name = child['slot'] || (((_a = child.nodeValue) === null || _a === void 0 ? void 0 : _a.trim()) && 'default');
        if (!name)
            continue;
        slots[name] = true;
    }
    return slots;
};
