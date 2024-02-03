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
                    const referencePaths = binding.referencePaths.filter((referencePath) => {
                        if (t.isCallExpression(referencePath.parent) &&
                            t.isDecorator(referencePath.parentPath.parent) &&
                            t.isClassDeclaration(referencePath.parentPath.parentPath.parent) &&
                            t.isExportNamedDeclaration(referencePath.parentPath.parentPath.parentPath.parent))
                            return true;
                    });
                    if (referencePaths.length > 1) {
                        throw new Error('In each file, only one custom element can be defined. \n' +
                            'If more than one @Element() decorator is used in the file, it will result in an error.\n');
                    }
                    context.skipped = false;
                    if (referencePaths.length == 1)
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
