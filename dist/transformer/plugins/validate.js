import t from '@babel/types';
import * as CONSTANTS from '../../constants/index.js';
import { visitor } from '../utils/index.js';
export const validate = () => {
    const name = 'validate';
    const run = (context) => {
        context.skipped = true;
        visitor(context.fileAST, {
            ImportDeclaration(path) {
                var _a;
                if (((_a = path.node.source) === null || _a === void 0 ? void 0 : _a.value) !== CONSTANTS.PACKAGE_NAME)
                    return;
                for (const specifier of path.node.specifiers) {
                    if (specifier.imported.name !== CONSTANTS.DECORATOR_ELEMENT)
                        continue;
                    const binding = path.scope.getBinding(specifier.imported.name);
                    if (binding.references == 0)
                        break;
                    if (binding.references > 1) {
                        throw new Error('In each file, only one custom element can be defined. \n' +
                            'If more than one @Element() decorator is used in the file, it will result in an error.\n');
                    }
                    context.skipped = false;
                    const reference = binding.referencePaths[0];
                    if (t.isCallExpression(reference.parent) &&
                        t.isDecorator(reference.parentPath.parent) &&
                        t.isClassDeclaration(reference.parentPath.parentPath.parent) &&
                        t.isExportNamedDeclaration(reference.parentPath.parentPath.parentPath.parent))
                        break;
                    throw new Error('It appears that the class annotated with the @Element() decorator is not being exported correctly.');
                }
                path.stop();
            }
        });
        context.skipped;
    };
    return { name, run };
};
