import * as CONSTANTS from '../../constants/index.js';
export const getStyles = (target) => {
    return target.constructor[CONSTANTS.STATIC_STYLE] ?? target[CONSTANTS.STATIC_STYLE];
};
