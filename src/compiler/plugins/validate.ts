import * as CONSTANTS from '../../constants/index.js';
import { Context } from '../../types/index.js';
import { hasDecorator, visitor } from '../utils/index.js';

export const validate = () => {
  const name = 'validate';

  const next = (context: Context) => {

    if (context.isInvalid) return;

    visitor(context.fileAST!, {
      ImportDeclaration(path) {
        context.isInvalid = true;
        if (path.node.source?.value !== CONSTANTS.PACKAGE_NAME) return;
        for (const specifier of path.node.specifiers) {
          if (specifier.imported.name !== CONSTANTS.DECORATOR_ELEMENT) continue;
          context.isInvalid = false;
        }
      }
    });

    if (context.isInvalid) return;

    let hasValidExport;

    visitor(context.fileAST!, {
      ExportNamedDeclaration(path) {
        context.isInvalid = true;
        if (hasValidExport) return path.stop();
        if (path.node.declaration.type !== 'ClassDeclaration') return;
        if (!hasDecorator(path.node.declaration, CONSTANTS.DECORATOR_ELEMENT)) return;
        context.isInvalid = false;
        hasValidExport = true
      }
    });
  };

  return {
    name,
    next
  };
};
