import { File, Node } from '@babel/types';

import { visitor } from './visitor.js';

export const getTypeReference = (file: File, node: Node): string | undefined => {
  if (!node) return;

  if (node.type != 'TSTypeReference') return;

  let result;

  visitor(file, {
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

        result = path.node.source.value;

        path.stop();

        break;
      }
    }
  });

  return result;
};
