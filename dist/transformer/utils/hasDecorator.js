export const hasDecorator = (node, name) => {
    if (!node.decorators)
        return false;
    return !!node.decorators.some((decorator) => { var _a; return ((_a = decorator.expression.callee) === null || _a === void 0 ? void 0 : _a.name) == name; });
};
