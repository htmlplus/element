export const hasDecorator = (node: any, name: string) => {

    if (!node.decorators) return false;

    return !!node.decorators.some((decorator) => decorator.expression.callee?.name == name);
}