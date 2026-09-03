import ts from 'typescript';

import * as CONSTANTS from '@/constants';

export const validate = (parsed: ts.SourceFile): boolean => {
	return parsed.statements
		.filter((statement) => ts.isImportDeclaration(statement))
		.filter(
			(statement) =>
				ts.isStringLiteral(statement.moduleSpecifier) &&
				statement.moduleSpecifier.text === CONSTANTS.PACKAGE_NAME
		)
		.flatMap((statement) => {
			const bindings = statement.importClause?.namedBindings;
			if (!bindings || !ts.isNamedImports(bindings)) return [];
			return bindings.elements;
		})
		.some((element) => {
			const name = (element.propertyName ?? element.name).text;
			if (name === CONSTANTS.DECORATOR_ELEMENT) return true;
			if (name === CONSTANTS.DECORATOR_PROPERTY) return true;
			return false;
		});
};
