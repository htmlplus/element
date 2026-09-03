import ts from 'typescript';

export const getTypeReference = (type?: ts.TypeNode): string | undefined => {
	if (!type || !ts.isTypeReferenceNode(type)) return;

	const typeName = type.typeName;

	if (!ts.isIdentifier(typeName)) return;

	const sourceFile = type.getSourceFile();

	for (const statement of sourceFile.statements) {
		if (!ts.isImportDeclaration(statement)) continue;

		for (const specifier of statement.importClause?.namedBindings
			? ts.isNamedImports(statement.importClause.namedBindings)
				? statement.importClause.namedBindings.elements
				: []
			: []) {
			const localName = specifier.name.text;
			const importedName = specifier.propertyName?.text ?? localName;

			if (localName === typeName.text || importedName === typeName.text) {
				return ts.isStringLiteral(statement.moduleSpecifier)
					? statement.moduleSpecifier.text
					: undefined;
			}
		}
	}

	return;
};
