import * as CONSTANTS from '../../constants/index.js';
import { Context, Plugin } from '../../types';
import { hasDecorator, visitor } from '../utils/index.js';

export const validate = (): Plugin => {
  const name = 'validate';

  const run = (context: Context) => {
    let hasValidImport;
    visitor(context.fileAST!, {
      ImportDeclaration(path) {
        if (path.node.source?.value !== CONSTANTS.PACKAGE_NAME) return;
        for (const specifier of path.node.specifiers) {
          if (specifier.imported.name !== CONSTANTS.DECORATOR_ELEMENT) continue;
          hasValidImport = true;
          path.stop();
        }
      }
    });

    let hasValidExport;
    visitor(context.fileAST!, {
      ExportNamedDeclaration(path) {
        if (hasValidExport) {
          hasValidExport = false;
          return path.stop();
        }
        if (path.node.declaration.type !== 'ClassDeclaration') return;
        if (!hasDecorator(path.node.declaration, CONSTANTS.DECORATOR_ELEMENT)) return;
        hasValidExport = true;
      }
    });

    context.isInvalid = !hasValidImport || !hasValidExport;
  };

  return { name, run };
};
