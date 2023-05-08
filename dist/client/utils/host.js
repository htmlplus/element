import * as CONSTANTS from '../../constants/index.js';
export const host = (target) => {
    return target[CONSTANTS.API_HOST]();
};
