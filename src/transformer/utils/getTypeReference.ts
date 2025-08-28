import type t from '@babel/types';

import { visitor } from './visitor';

export const getTypeReference = (file: t.File, node: t.Node): string | undefined => {
	if (!node) return;

	if (node.type !== 'TSTypeReference') return;

	let result: string | undefined;

	visitor(file, {
		ImportDeclaration(path) {
			for (const specifier of path.node.specifiers) {
				const alias = specifier.local.name;

				if (node.typeName.type !== 'Identifier') continue;

				if (alias !== node.typeName.name) continue;

				result = path.node.source.value;

				path.stop();

				break;
			}
		}
	});

	return result;
};
