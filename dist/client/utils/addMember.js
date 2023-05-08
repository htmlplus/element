import * as CONSTANTS from '../../constants/index.js';
export const addMember = (target, key, data) => {
    var _a;
    target[_a = CONSTANTS.STATIC_MEMBERS] || (target[_a] = {});
    target[CONSTANTS.STATIC_MEMBERS][key] = data;
};
