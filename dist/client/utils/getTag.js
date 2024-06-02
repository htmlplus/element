import * as CONSTANTS from '../../constants/index.js';
export const getTag = (target) => {
    return target.constructor[CONSTANTS.STATIC_TAG] ?? target[CONSTANTS.STATIC_TAG];
};
