import t from '@babel/types';

export const hasDecorator = (node: t.Node, name: string): boolean => {
	if ('decorators' in node === false) return false;

	if (!node.decorators) return false;

	for (const decorator of node.decorators) {
		const expression = decorator.expression;

		if (!t.isCallExpression(expression)) continue;

		if (!t.isIdentifier(expression.callee)) continue;

		if (expression.callee.name === name) {
			return true;
		}
	}

	return false;
};
