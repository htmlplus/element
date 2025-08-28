import { dirname, join, resolve } from 'node:path';

import { parse } from '@babel/parser';
import type t from '@babel/types';
import fs from 'fs-extra';
import { glob } from 'glob';

import { visitor } from './visitor';

const getTypeReferenceName = (ref: t.TSTypeReference): string | undefined => {
	switch (ref.typeName.type) {
		case 'Identifier':
			return ref.typeName.name;
		default:
			return undefined;
	}
};

export const getType = (directory: string, file: t.File, node: t.Node): t.Node => {
	if (!node) return node;

	if (node.type !== 'TSTypeReference') return node;

	let result: t.Node | undefined;

	const typeName = getTypeReferenceName(node);

	if (!typeName) return node;

	visitor(file, {
		ClassDeclaration(path) {
			if (path.node.id?.name !== typeName) return;

			result = path.node;

			path.stop();
		},
		ImportDeclaration(path) {
			for (const specifier of path.node.specifiers) {
				const alias = specifier.local.name;

				if (alias !== typeName) continue;

				try {
					const reference = glob
						.sync(
							['.ts*', '/index.ts*'].map((key) => {
								return join(directory, path.node.source.value).replace(/\\/g, '/') + key;
							})
						)
						.find((reference) => reference && fs.existsSync(reference));

					if (!reference) continue;

					const content = fs.readFileSync(reference, 'utf8');

					const filePath = resolve(directory, `${path.node.source.value}.ts`);

					const pathWithAst = path as typeof path & { $ast?: t.File };

					pathWithAst.$ast ||= parse(content, {
						allowImportExportEverywhere: true,
						plugins: ['typescript'],
						ranges: false
					});

					result = getType(dirname(filePath), pathWithAst.$ast, node);
				} catch {}

				path.stop();

				break;
			}
		},
		TSInterfaceDeclaration(path) {
			if (path.node.id.name !== typeName) return;

			result = path.node;

			path.stop();
		},
		TSTypeAliasDeclaration(path) {
			if (path.node.id.name !== typeName) return;

			const typeAnnotation = path.node.typeAnnotation;

			switch (typeAnnotation.type) {
				case 'TSUnionType': {
					const types: t.TSType[] = [];

					for (const prev of typeAnnotation.types) {
						const next = getType(directory, file, prev) as t.TSType;

						if (next.type === 'TSUnionType') {
							types.push(...next.types);
						} else {
							types.push(next);
						}
					}

					typeAnnotation.types = types;

					result = typeAnnotation;

					break;
				}
				default: {
					result = getType(directory, file, typeAnnotation);
					break;
				}
			}

			path.stop();
		}
	});

	return result || node;
};
