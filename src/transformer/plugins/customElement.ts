import template from '@babel/template';
import t from '@babel/types';
import { kebabCase, pascalCase } from 'change-case';

import * as CONSTANTS from '@/constants';
import { extractAttribute, getType, print, visitor } from '@/transformer/utils';

import type { TransformerPlugin } from '../transformer.types';

// TODO: support {variable && jsxElement}
export const customElement: TransformerPlugin = (context) => {
	if (!context.fileAST) return;

	const ast = t.cloneNode(context.fileAST, true);

	context.elementTagName = `${context.elementKey}`;

	context.elementInterfaceName = `HTML${pascalCase(context.elementTagName)}Element`;

	// attach tag name
	visitor(ast, {
		ClassDeclaration(path) {
			const { body, id } = path.node;

			if (id?.name !== context.className) return;

			const node = t.classProperty(
				t.identifier(CONSTANTS.STATIC_TAG),
				t.stringLiteral(context.elementTagName || ''),
				undefined,
				undefined,
				undefined,
				true
			);

			t.addComment(node, 'leading', CONSTANTS.COMMENT_AUTO_ADDED, true);

			body.body.unshift(node);
		}
	});

	// add type to properties
	visitor(ast, {
		Decorator(path) {
			const { expression } = path.node;

			if (!t.isCallExpression(expression)) return;

			if (!t.isIdentifier(expression.callee)) return;

			if (expression.callee.name !== CONSTANTS.DECORATOR_PROPERTY) return;

			if (!expression.arguments.length) {
				expression.arguments.push(t.objectExpression([]));
			}

			const [argument] = expression.arguments;

			if (!t.isObjectExpression(argument)) return;

			const property = argument.properties.find((property) => {
				return (
					t.isObjectProperty(property) &&
					t.isIdentifier(property.key) &&
					property.key.name === CONSTANTS.DECORATOR_PROPERTY_TYPE
				);
			});

			if (property) return;

			let type = 0;

			const extract = (input) => {
				switch (input?.type) {
					case 'bool':
					case 'Boolean':
					case 'BooleanLiteral':
					case 'TSBooleanKeyword':
						type |= CONSTANTS.TYPE_BOOLEAN;
						break;
					case 'Date':
						type |= CONSTANTS.TYPE_DATE;
						break;
					case 'Number':
					case 'NumericLiteral':
					case 'TSNumberKeyword':
						type |= CONSTANTS.TYPE_NUMBER;
						break;
					case 'StringLiteral':
						type |= CONSTANTS.TYPE_ENUM;
						break;
					case 'TSStringKeyword':
						type |= CONSTANTS.TYPE_STRING;
						break;
					case 'Array':
					case 'TSArrayType':
					case 'TSTupleType':
						type |= CONSTANTS.TYPE_ARRAY;
						break;
					case 'TSLiteralType':
						extract(input.literal);
						break;
					case 'TSNullKeyword':
						type |= CONSTANTS.TYPE_NULL;
						break;
					case 'Object':
					case 'TSObjectKeyword':
					case 'TSMappedType':
					case 'TSTypeLiteral':
						type |= CONSTANTS.TYPE_OBJECT;
						break;
					case 'TSTypeReference':
						extract({ type: input?.typeName?.name });
						break;
					case 'TSUnionType':
						input.types.forEach(extract);
						break;
					// TODO
					case 'TSParenthesizedType': {
						if (input?.typeAnnotation?.type !== 'TSIntersectionType') break;

						let types = input.types || input.typeAnnotation.types;

						if (types.length !== 2) return;

						types = types.filter((type) => type.type !== 'TSTypeLiteral');

						if (types.length !== 1) return;

						extract(types[0]);

						break;
					}
				}
			};

			if (context.directoryPath) {
				extract(
					// biome-ignore lint: TODO
					getType(context.directoryPath, ast, path.parent['typeAnnotation']?.typeAnnotation)
				);
			}

			type = type || CONSTANTS.TYPE_ANY;

			argument.properties.push(
				t.objectProperty(t.identifier(CONSTANTS.DECORATOR_PROPERTY_TYPE), t.numericLiteral(type))
			);
		}
	});

	// attach typings
	visitor(ast, {
		Program(path) {
			const extractKeys = (
				members?: t.ClassMethod[] | t.ClassProperty[],
				// biome-ignore lint: TODO
				filter?: (member: any) => boolean
			) => {
				if (!members?.length) return 'never';
				return members
					.filter((method) => t.isIdentifier(method.key))
					.filter((method) => (filter ? filter?.(method) : true))
					.map((method) => (method.key as t.Identifier).name)
					.map((key) => `'${key}'`)
					.join(' | ');
			};

			const attributeMapper = (context.classProperties ?? [])
				.filter((property) => t.isIdentifier(property.key))
				.map((property) => {
					const name = (property.key as t.Identifier).name;

					const attr = extractAttribute(property) || kebabCase((property.key as t.Identifier).name);

					if (name === attr) return '';

					return `'${name}': '${attr}'`;
				})
				.filter(Boolean)
				.join(',\n');

			const ast = template.default.ast(
				`
					// THE FOLLOWING TYPES HAVE BEEN ADDED AUTOMATICALLY

					type Filter<Base, Disables> = {
						[K in keyof Base as K extends keyof Disables
							? [Disables[K]] extends [false]
								? never
								: K
							: '*' extends keyof Disables
								? [Disables['*']] extends [false]
									? never
									: K
								: K]: Base[K];
					};

					type Override<
						Base,
						Overrides,
						AllowedKeys
					> = {
						[K in keyof Base]:
							K extends AllowedKeys
								? K extends keyof Overrides
									? Overrides[K]
									: Base[K]
								: Base[K];
					};

					type ToEventHandlers<T> = {
						[K in keyof T]?: T[K] extends EventEmitter<infer U> ? (event: CustomEvent<U>) => void : T[K];
					};

					type ToJSXEvent<T> = { [K in keyof T as \`on\${Capitalize<string & K>}\`]: T[K]; };

					type Rename<
						T,
						M extends Partial<Record<keyof T, PropertyKey>>
					> =
						Partial<Pick<T, Exclude<keyof T, keyof M>>>
						&
						{
							[K in keyof M as M[K] extends PropertyKey ? M[K] : K]?: K extends keyof T ? T[K] : never;
						};

					export type ${context.className}AttributesMapper = {
						${attributeMapper}
					};

					export type ${context.className}OverridableKeys = ${extractKeys(context.classProperties, (property) => property.typeAnnotation?.typeAnnotation?.typeName?.name === 'OverridableValue')};

					export interface ${context.className}Disables {}

					export interface ${context.className}Overrides {}

					export type ${context.className}Attributes = Rename<
						${context.className}Properties, 
						${context.className}AttributesMapper
					>;

					export type ${context.className}AttributesOverridden = Rename<
						${context.className}PropertiesOverridden,
						${context.className}AttributesMapper
					>;

					export type ${context.className}AttributesBase = Rename<
						${context.className}PropertiesBase,
						${context.className}AttributesMapper
					>;

					export type ${context.className}Events = Filter<
						${context.className}EventsBase, 
						${context.className}Disables
					>;

					export type ${context.className}EventsBase = ToEventHandlers<Pick<${context.className}, ${context.className}EventsKeys>>;

					export type ${context.className}EventsKeys = ${extractKeys(context.classEvents)};

					export type ${context.className}EventsJSX = ToJSXEvent<${context.className}Events>;

					export type ${context.className}EventsBaseJSX = ToJSXEvent<${context.className}EventsBase>;

					export type ${context.className}Methods = Filter<
						${context.className}MethodsBase, 
						${context.className}Disables
					>;

					export type ${context.className}MethodsBase = Pick<
						${context.className},
						${context.className}MethodsKeys
					>;

					export type ${context.className}MethodsKeys = ${extractKeys(context.classMethods)};

					export type ${context.className}Properties = Filter<
						${context.className}PropertiesOverridden, 
						${context.className}Disables
					>;

					export type ${context.className}PropertiesOverridden = Override<
						${context.className}PropertiesBase, 
						${context.className}Overrides, 
						${context.className}OverridableKeys
					>;

					export type ${context.className}PropertiesBase = Pick<
						${context.className},
						${context.className}PropertiesKeys
					>;

					export type ${context.className}PropertiesKeys = ${extractKeys(context.classProperties)};

					export type ${context.className}Element = globalThis.${context.elementInterfaceName};

					export type ${context.className}JSX = ${context.className}Attributes & ${context.className}EventsJSX;
						
					export namespace JSX {
						interface IntrinsicElements {
							"${context.elementTagName}": ${context.className}JSX;
						}
					}

					declare global {
						interface ${context.elementInterfaceName} extends HTMLElement, ${context.className}Methods, ${context.className}Properties { }

						var ${context.elementInterfaceName}: {
							prototype: ${context.elementInterfaceName};
							new (): ${context.elementInterfaceName};
						};

						interface HTMLElementTagNameMap {
							"${context.elementTagName}": ${context.elementInterfaceName};
						}
					}

					declare module '${CONSTANTS.PACKAGE_NAME}' {
						interface HTMLPlusElements {
							'${context.elementTagName}': {
								properties: ${context.className}PropertiesOverridden;
							}
						}
					}
					
					declare module "react" {
						namespace JSX {
							interface IntrinsicElements {
								"${context.elementTagName}": ${context.className}JSX & Omit<DetailedHTMLProps<HTMLAttributes<${context.elementInterfaceName}>, ${context.elementInterfaceName}>, keyof ${context.className}JSX>;
							}
						}
					}
				`,
				{
					plugins: ['typescript'],
					preserveComments: true
				}
			);

			path.node.body.push(...ast);
		}
	});

	context.script = print(ast);
};
