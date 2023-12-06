export const getInitializer = (node) => {
    var _a;
    return ((_a = node === null || node === void 0 ? void 0 : node.extra) === null || _a === void 0 ? void 0 : _a.raw) || (node === null || node === void 0 ? void 0 : node['value']);
};
