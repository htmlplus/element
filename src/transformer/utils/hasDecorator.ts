export const hasDecorator = (node: any, name: string): boolean => {
  if (!node.decorators) return false;

  return !!node.decorators.some((decorator) => decorator.expression.callee?.name == name);
};
