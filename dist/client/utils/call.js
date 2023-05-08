export const call = (target, key, ...parameters) => {
    var _a;
    return (_a = target[key]) === null || _a === void 0 ? void 0 : _a.call(target, ...parameters);
};
