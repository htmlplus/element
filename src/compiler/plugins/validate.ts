import { DECORATOR_ELEMENT } from '../../constants/index.js';
import { Context } from '../../types/index.js';
import { hasDecorator } from '../utils/has-decorator.js';
import { visitor } from '../utils/visitor.js';

export const validate = () => {
  const name = 'validate';

  // rules:
  // 1: Should export only one class
  // 2: that class should have @Element decorator
  // 3: should import Element from '@htmlplus/element'

  const next = (context: Context) => {
    let message;
    let hasValidImport = false;
    let hasValidExport = false;

    visitor(context.fileAST as any, {
      ImportDeclaration: {
        enter(path) {
          if (path.node.source?.value !== '@htmlplus/element') {
            return;
          }

          // should import Element
          path.node.specifiers.map((specifier) => {
            if (specifier.imported.name === DECORATOR_ELEMENT) {
              hasValidImport = true;
            }
          });
        }
      },
      ExportNamedDeclaration: {
        enter(path) {
          if (path.node.declaration.type !== 'ClassDeclaration') {
            // skip
            return;
          }
          if (hasValidExport) {
            hasValidExport = false;
            // TODO: filename, stackreact, line number...
            // context.WHAT? = `You should only export one class from ${context.fileName}`);
            return;
          }

          if (!hasDecorator(path.node, DECORATOR_ELEMENT)) {
            // context.WHAT? = `you should use @${DECORATOR_ELEMENT} decorator for class`);
            return;
          }

          hasValidExport = true;
        }
      }
    });

    context.isInvalid = !(hasValidImport && hasValidExport);

    return context;
  };

  return {
    name,
    next
  };
};
