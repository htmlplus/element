export const hasDecorator = (node, name) => {
    if (!node.decorators)
        return false;
    return !!node.decorators.some((decorator) => decorator.expression.callee?.name == name);
};
