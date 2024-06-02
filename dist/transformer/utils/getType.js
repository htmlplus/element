import { parse } from '@babel/parser';
import fs from 'fs-extra';
import { glob } from 'glob';
import { dirname, resolve } from 'path';
import { join } from 'path';
import { visitor } from './visitor.js';
export const getType = (directory, file, node) => {
    if (!node)
        return node;
    if (node.type != 'TSTypeReference')
        return node;
    let result;
    visitor(file, {
        ClassDeclaration(path) {
            if (path.node.id.name != node.typeName['name'])
                return;
            result = path.node;
            path.stop();
        },
        ImportDeclaration(path) {
            for (const specifier of path.node.specifiers) {
                const alias = specifier.local.name;
                if (alias != node.typeName['name'])
                    continue;
                let key;
                switch (specifier.type) {
                    case 'ImportNamespaceSpecifier':
                        key = '*';
                        break;
                    case 'ImportDefaultSpecifier':
                        key = 'default';
                        break;
                    case 'ImportSpecifier':
                        key = specifier.imported.name;
                        break;
                }
                try {
                    const reference = glob
                        .sync(['.ts*', '/index.ts*'].map((key) => {
                        return join(directory, path.node.source.value).replace(/\\/g, '/') + key;
                    }))
                        .find((reference) => fs.existsSync(reference));
                    const content = fs.readFileSync(reference, 'utf8');
                    const filePath = resolve(directory, path.node.source.value + '.ts');
                    path.$ast ||= parse(content, {
                        allowImportExportEverywhere: true,
                        plugins: ['typescript'],
                        ranges: false
                    });
                    result = getType(dirname(filePath), path.$ast, node);
                }
                catch { }
                path.stop();
                break;
            }
        },
        TSInterfaceDeclaration(path) {
            if (path.node.id.name != node.typeName['name'])
                return;
            result = path.node;
            path.stop();
        },
        TSTypeAliasDeclaration(path) {
            if (path.node.id.name != node.typeName['name'])
                return;
            result = path.node.typeAnnotation;
            switch (result.type) {
                case 'TSUnionType':
                    const types = [];
                    for (const prev of result.types) {
                        const next = getType(directory, file, prev);
                        if (next.type == 'TSUnionType') {
                            next.types.forEach((type) => types.push(type));
                        }
                        else {
                            types.push(next);
                        }
                    }
                    result.types = types;
                    break;
                default:
                    result = getType(directory, file, result);
                    break;
            }
            path.stop();
        }
    });
    return result || node;
};
