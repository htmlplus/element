import { parse } from '@babel/parser';
import { File, Node } from '@babel/types';
import glob from 'fast-glob';
import fs from 'fs-extra';
import { dirname, resolve } from 'path';
import { join } from 'path';

import { visitor } from './visitor.js';

// TODO: return type
export const getType = (file: File, node: Node, options): any => {
  if (!node) return node;

  if (node.type != 'TSTypeReference') return node;

  const { directory } = options;

  let result;

  visitor(file, {
    ClassDeclaration(path) {
      if (path.node.id.name != node.typeName['name']) return;

      result = path.node;

      path.stop();
    },
    ImportDeclaration(path) {
      for (const specifier of path.node.specifiers) {
        const alias = specifier.local.name;

        if (alias != node.typeName['name']) continue;

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
            .sync(
              ['.ts*', '/index.ts*'].map((key) => {
                return join(directory, path.node.source.value).replace(/\\/g, '/') + key;
              })
            )
            .find((reference) => fs.existsSync(reference));

          const content = fs.readFileSync(reference, 'utf8');

          const filePath = resolve(directory, path.node.source.value + '.ts');

          path.$ast ||= parse(content, {
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
      if (path.node.id.name != node.typeName['name']) return;

      result = path.node;

      path.stop();
    },
    TSTypeAliasDeclaration(path) {
      if (path.node.id.name != node.typeName['name']) return;

      result = path.node.typeAnnotation;

      path.stop();
    }
  });

  return result || node;
};
