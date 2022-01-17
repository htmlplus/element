import { parse } from '@babel/parser';
import { File } from '@babel/types';
import fs from 'fs';
import { dirname, resolve } from 'path';

import { visitor } from './visitor.js';

// TODO: return type
export const getType = (file: File, node: any, options) => {
  if (!node) return node;

  if (node.type != 'TSTypeReference') return node;

  const { directory } = options;

  let result;

  visitor(file, {
    ClassDeclaration(path) {
      if (path.node.id.name != node.typeName.name) return;

      result = path.node;

      path.stop();
    },
    ImportDeclaration(path) {
      for (const specifier of path.node.specifiers) {
        const alias = specifier.local.name;

        if (alias != node.typeName.name) continue;

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
          const filePath = resolve(directory, path.node.source.value + '.ts');

          path.$ast =
            path.$ast ||
            parse(fs.readFileSync(filePath, 'utf8'), {
              allowImportExportEverywhere: true,
              plugins: ['typescript'],
              ranges: false
            });

          result = getType(path.$ast, node, {
            directory: dirname(filePath)
          });
        } catch {}

        path.stop();

        break;
      }
    },
    TSInterfaceDeclaration(path) {
      if (path.node.id.name != node.typeName.name) return;

      result = path.node;

      path.stop();
    },
    TSTypeAliasDeclaration(path) {
      if (path.node.id.name != node.typeName.name) return;

      result = path.node;

      path.stop();
    }
  });

  return result || node;
};
