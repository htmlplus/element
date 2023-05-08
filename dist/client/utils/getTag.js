import * as CONSTANTS from '../../constants/index.js';
export const getTag = (target) => {
    var _a;
    return (_a = target.constructor[CONSTANTS.STATIC_TAG]) !== null && _a !== void 0 ? _a : target[CONSTANTS.STATIC_TAG];
};
