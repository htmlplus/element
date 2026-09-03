import ts from 'typescript';

export const hasStaticClassProperty = (node: ts.ClassDeclaration, name: string): boolean => {
	return node.members.some(
		(member) =>
			ts.isPropertyDeclaration(member) &&
			member.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword) &&
			ts.isIdentifier(member.name) &&
			member.name.text === name
	);
};
