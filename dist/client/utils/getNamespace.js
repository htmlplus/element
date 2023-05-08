import { getTag } from './getTag.js';
export const getNamespace = (instance) => {
    return getTag(instance).split('-')[0].toUpperCase();
};
