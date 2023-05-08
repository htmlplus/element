import t from '@babel/types';
import * as CONSTANTS from '../../constants/index.js';
import { visitor } from './visitor.js';
export function addDependency(path, source, local, imported) {
    const isDefault = local && !imported;
    const isImport = local && imported;
    const isNormal = !local && !imported;
    let declaration;
    let file = path;
    while (file.parentPath)
        file = file.parentPath;
    file = file.node || file;
    visitor(file, {
        ImportDeclaration(path) {
            if (path.node.source.value != source)
                return;
            declaration = path.node;
        }
    });
    if (isNormal && declaration)
        return {
            node: declaration
        };
    let specifier = declaration === null || declaration === void 0 ? void 0 : declaration.specifiers.find((specifier) => {
        var _a;
        if (isDefault) {
            return specifier.type == 'ImportDefaultSpecifier';
        }
        else if (isImport) {
            return ((_a = specifier.imported) === null || _a === void 0 ? void 0 : _a.name) == imported;
        }
    });
    if (specifier)
        return {
            local: specifier.local.name,
            node: declaration
        };
    if (isDefault) {
        specifier = t.importDefaultSpecifier(t.identifier(local));
    }
    else if (isImport) {
        specifier = t.importSpecifier(t.identifier(local), t.identifier(imported));
    }
    if (declaration) {
        if (isDefault) {
            declaration.specifiers.unshift(specifier);
        }
        else if (isImport) {
            declaration.specifiers.push(specifier);
        }
    }
    else {
        declaration = t.importDeclaration(specifier ? [specifier] : [], t.stringLiteral(source));
        // TODO
        (file.program || file).body.unshift(declaration);
        // TODO
        t.addComment(declaration, 'leading', CONSTANTS.COMMENT_AUTO_ADDED_DEPENDENCY, true);
    }
    return {
        local,
        node: declaration
    };
}
