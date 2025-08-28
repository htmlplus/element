import t from '@babel/types';

import * as CONSTANTS from '@/constants';
import { visitor } from '@/transformer/utils';

import type { TransformerPlugin, TransformerPluginContext } from '../transformer.types';

export const validate = (): TransformerPlugin => {
	const name = 'validate';

	const run = (context: TransformerPluginContext) => {
		context.skipped = true;

		if (!context.fileAST) return;

		visitor(context.fileAST, {
			ImportDeclaration(path) {
				if (path.node.source?.value !== CONSTANTS.PACKAGE_NAME) return;

				for (const specifier of path.node.specifiers) {
					if (
						!t.isImportSpecifier(specifier) ||
						!t.isIdentifier(specifier.imported) ||
						specifier.imported.name !== CONSTANTS.DECORATOR_ELEMENT
					) {
						continue;
					}

					const binding = path.scope.getBinding(specifier.imported.name);

					if (!binding || binding.references === 0) {
						continue;
					}

					const referencePaths = binding.referencePaths.filter((referencePath) => {
						return (
							t.isCallExpression(referencePath.parent) &&
							t.isDecorator(referencePath.parentPath?.parent) &&
							t.isClassDeclaration(referencePath.parentPath.parentPath?.parent) &&
							t.isExportNamedDeclaration(referencePath.parentPath.parentPath.parentPath?.parent)
						);
					});

					if (referencePaths.length > 1) {
						throw new Error(
							'In each file, only one custom element can be defined. \n' +
								'If more than one @Element() decorator is used in the file, it will result in an error.\n'
						);
					}

					context.skipped = false;

					if (referencePaths.length === 1) {
						break;
					}

					throw new Error(
						'It appears that the class annotated with the @Element() decorator is not being exported correctly.'
					);
				}

				path.stop();
			}
		});

		context.skipped;
	};

	return { name, run };
};
