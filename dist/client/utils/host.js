import * as CONSTANTS from '../../constants/index.js';
/**
 * Indicates the host of the element.
 */
export const host = (target) => {
    try {
        return target[CONSTANTS.API_HOST]();
    }
    catch {
        return target;
    }
};
