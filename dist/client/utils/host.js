import * as CONSTANTS from '../../constants/index.js';
/**
 * Indicates the host of the element.
 */
export const host = (target) => {
    return target[CONSTANTS.API_HOST]();
};
