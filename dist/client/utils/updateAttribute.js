import { paramCase } from 'change-case';
export const updateAttribute = (node, key, value) => {
    const name = paramCase(key);
    if ([undefined, null, false].includes(value))
        return node.removeAttribute(name);
    node.setAttribute(name, value === true ? '' : value);
};
