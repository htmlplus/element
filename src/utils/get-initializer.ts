import { Expression } from '@babel/types';

// TODO: return type
export const getInitializer = (node: Expression) => {

    if (!node) return node;

    const value = node;

    if (!value) return;

    const extra = value.extra || {};

    return extra.raw || value['value'];
}