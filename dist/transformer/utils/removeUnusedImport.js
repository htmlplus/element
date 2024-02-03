import t from '@babel/types';
import { visitor } from './visitor.js';
// TODO
export const removeUnusedImport = (ast) => {
    visitor(ast, {
        Program: {
            exit(path) {
                for (const entry of Object.entries(path.scope.bindings)) {
                    let { kind, path, referenced, referencePaths } = entry[1];
                    if (kind !== 'module')
                        continue;
                    if (referenced) {
                        referenced = false;
                        for (const referencePath of referencePaths) {
                            let find = true;
                            let parent = referencePath;
                            while (parent) {
                                if (!parent.node) {
                                    find = false;
                                    break;
                                }
                                parent = parent.parentPath;
                            }
                            if (!find)
                                continue;
                            referenced = true;
                            break;
                        }
                    }
                    if (referenced)
                        continue;
                    const source = path.parentPath.get('source');
                    if (!t.isStringLiteral(source))
                        continue;
                    if (path.isImportSpecifier()) {
                        path.remove();
                        if (path.parentPath.node.specifiers.length)
                            continue;
                        path.parentPath.remove();
                        continue;
                    }
                    if (!path.parentPath)
                        continue;
                    path.parentPath.remove();
                }
            }
        }
    });
};
