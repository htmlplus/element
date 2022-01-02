import { paramCase } from 'change-case';

export const updateAttribute = (node: Element, key: string, value: any): void => {

    key = paramCase(key);

    if (value === undefined) {
        node.removeAttribute(key);
    }
    else if (value === null) {
        node.removeAttribute(key);
    }
    else if (value === false) {
        node.removeAttribute(key);
    }
    else if (value === true) {
        node.setAttribute(key, '');
    }
    else {
        node.setAttribute(key, value);
    }
}