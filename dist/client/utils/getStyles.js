import * as CONSTANTS from '../../constants/index.js';
export const getStyles = (target) => {
    var _a;
    return (_a = target.constructor[CONSTANTS.STATIC_STYLE]) !== null && _a !== void 0 ? _a : target[CONSTANTS.STATIC_STYLE];
};
