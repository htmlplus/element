import ts from 'typescript';

export const findDecorator = (node: ts.Node, name: string): ts.Decorator | undefined => {
	if (!ts.canHaveDecorators(node)) return;

	const decorators = ts.getDecorators(node);

	if (!decorators) return;

	for (const decorator of decorators) {
		const expression = decorator.expression;

		if (!ts.isCallExpression(expression)) continue;

		if (!ts.isIdentifier(expression.expression)) continue;

		if (expression.expression.text === name) return decorator;
	}
};
