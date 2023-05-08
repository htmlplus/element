import * as CONSTANTS from '../../constants/index.js';
// TODO
export const getMembers = (target) => {
    return target[CONSTANTS.STATIC_MEMBERS] || {};
};
