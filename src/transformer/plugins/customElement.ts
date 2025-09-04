import template from '@babel/template';
import t from '@babel/types';
import { camelCase, kebabCase, pascalCase } from 'change-case';

import * as CONSTANTS from '@/constants';
import { addDependency, extractAttribute, getType, print, visitor } from '@/transformer/utils';

import type {
	InvertOptional,
	TransformerPlugin,
	TransformerPluginContext
} from '../transformer.types';

export const CUSTOM_ELEMENT_OPTIONS: InvertOptional<CustomElementOptions> = {
	prefix: '',
	typings: true
};

export interface CustomElementOptions {
	prefix?: string;
	typings?: boolean;
}

// TODO: support {variable && jsxElement}
export const customElement = (userOptions?: CustomElementOptions): TransformerPlugin => {
	const name = 'customElement';

	const options = Object.assign(
		{},
		CUSTOM_ELEMENT_OPTIONS,
		userOptions
	) as Required<CustomElementOptions>;

	const run = (context: TransformerPluginContext) => {
		if (!context.fileAST) return;

		const ast = t.cloneNode(context.fileAST, true);

		context.elementTagName = `${options.prefix}${context.elementKey}`;

		context.elementInterfaceName = `HTML${pascalCase(context.elementTagName)}Element`;

		// TODO
		const namespace = context.elementTagName.split('-').at(0) || '';

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

		// attach style mapper for 'style' attribute
		visitor(ast, {
			JSXAttribute(path) {
				const { name, value } = path.node;

				if (name.name !== 'style') return;

				if (!value) return;

				if (value.type !== 'JSXExpressionContainer') return;

				if (!value.expression) return;

				if (value.expression.type === 'JSXEmptyExpression') return;

				const { local } = addDependency(
					path,
					CONSTANTS.UTILS_PATH,
					CONSTANTS.UTILS_STYLES_LOCAL,
					CONSTANTS.UTILS_STYLES_IMPORTED
				);

				path.replaceWith(
					t.jsxAttribute(
						t.jsxIdentifier('style'),
						t.jsxExpressionContainer(
							t.callExpression(t.identifier(local || ''), [value.expression])
						)
					)
				);

				path.skip();
			}
		});

		// replace 'className' attribute with 'class'
		visitor(ast, {
			JSXAttribute(path) {
				const { name, value } = path.node;

				if (name.name !== 'className') return;

				if (!value) return;

				if (!t.isJSXOpeningElement(path.parent)) return;

				const hasClass = path.parent.attributes.some((attribute) => {
					return t.isJSXAttribute(attribute) && attribute.name.name === 'class';
				});

				if (hasClass) return path.remove();

				path.replaceWith(t.jsxAttribute(t.jsxIdentifier('class'), value));
			}
		});

		// TODO
		visitor(ast, {
			JSXAttribute(path) {
				const { name, value } = path.node;

				if (!t.isJSXIdentifier(name)) return;

				if (name.name === 'value') {
					name.name = `.${name.name}`;
					return;
				}

				if (name.name === 'disabled') {
					name.name = `.${name.name}`;
					return;
				}

				const key = ['tabIndex', 'viewBox'];

				if (!key.includes(name.name)) return;

				path.replaceWith(t.jsxAttribute(t.jsxIdentifier(name.name.toLowerCase()), value));
			}
		});

		// TODO
		// convert 'jsx' to 'uhtml' syntax
		visitor(ast, {
			enter(path) {
				const { type } = path.node;

				if (!['JSXElement', 'JSXFragment'].includes(type)) return;

				const TODO = (node, attributes) => {
					const { local } = addDependency(
						path,
						CONSTANTS.UTILS_PATH,
						CONSTANTS.UTILS_ATTRIBUTES_LOCAL,
						CONSTANTS.UTILS_ATTRIBUTES_IMPORTED
					);
					return t.callExpression(t.identifier(local || ''), [
						node,
						t.arrayExpression(
							attributes.map((attribute) => {
								switch (attribute.type) {
									case 'JSXSpreadAttribute':
										return attribute.argument;
									default:
										return t.objectExpression([
											t.objectProperty(
												t.stringLiteral(attribute.name.name),
												attribute.value?.type === 'JSXExpressionContainer'
													? attribute.value.expression
													: attribute.value || t.booleanLiteral(true)
											)
										]);
								}
							})
						)
					]);
				};

				const render = (node) => {
					switch (node.type) {
						case 'JSXElement': {
							const attributes = node.openingElement.attributes;

							const isHost = node.openingElement.name.name === CONSTANTS.ELEMENT_HOST_NAME;

							// TODO
							if (isHost) {
								const children = node.children.flatMap(render);

								if (!attributes.length) return children;

								return [TODO(t.thisExpression(), attributes), ...children];
							}

							const name = node.openingElement.name.name;

							const children = node.children.flatMap(render);

							const parts: unknown[] = [];

							parts.push('<', name);

							const hasSpreadAttribute = attributes.some((attribute) => {
								return attribute.type === 'JSXSpreadAttribute';
							});

							if (hasSpreadAttribute) {
								parts.push(
									' ',
									'ref=',
									t.arrowFunctionExpression(
										[t.identifier('$element')],
										TODO(t.identifier('$element'), attributes)
									)
								);
							} else {
								for (const attribute of attributes) {
									switch (attribute.type) {
										case 'JSXAttribute':
											if (attribute.name.name === 'dangerouslySetInnerHTML') {
												try {
													parts.push(' ', '.innerHTML');
													parts.push('=');
													parts.push(attribute.value.expression.properties.at(0).value);
												} catch {}
												continue;
											}

											parts.push(' ', attribute.name.name);

											if (!attribute.value) continue;

											parts.push('=');

											switch (attribute.value.type) {
												case 'JSXExpressionContainer':
													parts.push(attribute.value.expression);
													break;
												default:
													parts.push(attribute.value.extra.raw);
													break;
											}
											break;
										default:
											parts.push(' ', attribute);
											break;
									}
								}
							}

							parts.push(node.closingElement ? '>' : ' />');

							parts.push(...children);

							if (node.closingElement) {
								parts.push('<', '/', name, '>');
							}

							return parts;
						}

						case 'JSXFragment':
							return node.children.flatMap(render);

						case 'JSXText':
							return [node.extra.raw];

						case 'JSXExpressionContainer':
							if (node.expression.type === 'JSXEmptyExpression') return [];
							return [node.expression];
					}
				};

				const transform = (parts) => {
					const quasis: t.TemplateElement[] = [];

					const expressions: (t.Expression | t.TSType)[] = [];

					let i = 0;

					while (i < parts.length + 1) {
						let quasi = '';

						while (typeof parts[i] === 'string') {
							quasi += parts[i].replace(/[\\`]/g, (s) => `\\${s}`);
							i += 1;
						}

						quasis.push(t.templateElement({ raw: quasi }));

						if (parts[i] != null) expressions.push(parts[i]);

						i += 1;
					}

					const templateLiteral = t.templateLiteral(quasis, expressions);

					// TODO
					// if (!expressions.length) return template;

					const { local } = addDependency(
						path,
						CONSTANTS.UTILS_PATH,
						CONSTANTS.UTILS_HTML_LOCAL,
						CONSTANTS.UTILS_HTML_IMPORTED,
						true
					);

					return t.taggedTemplateExpression(t.identifier(local || ''), templateLiteral);
				};

				path.replaceWith(transform(render(path.node)));
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

				argument.properties.push(
					t.objectProperty(t.identifier(CONSTANTS.DECORATOR_PROPERTY_TYPE), t.numericLiteral(type))
				);
			}
		});

		// attach typings
		if (options.typings) {
			visitor(ast, {
				Program(path) {
					const attributes = (context.classProperties || [])
						.filter((property) => !t.isClassMethod(property))
						.map((property) => {
							const keyName =
								extractAttribute(property) ??
								(t.isIdentifier(property.key) ? kebabCase(property.key.name) : '');

							const typeAnnotation = property.typeAnnotation
								? (property.typeAnnotation as t.TSTypeAnnotation)
								: undefined;

							const signature = t.tSPropertySignature(
								t.stringLiteral(kebabCase(keyName)),
								typeAnnotation
							);

							signature.optional = property.optional ?? false;

							signature.leadingComments = t.cloneNode(property, true).leadingComments;

							return signature;
						});

					const events = (context.classEvents ?? [])
						.map((event) => {
							if (!t.isIdentifier(event.key)) return null;

							const key = event.key;

							const parameter = t.identifier('event');

							parameter.typeAnnotation = t.tsTypeAnnotation(
								t.tsTypeReference(
									t.identifier('CustomEvent'),
									// biome-ignore lint: TODO
									event.typeAnnotation?.['typeAnnotation']?.typeParameters
								)
							);

							const functionType = t.tsFunctionType(
								undefined,
								[parameter],
								t.tsTypeAnnotation(t.tsVoidKeyword())
							);

							const signature = t.tSPropertySignature(
								t.identifier(camelCase(`on-${key.name}`)),
								t.tsTypeAnnotation(functionType)
							);

							signature.optional = true;

							signature.leadingComments = t.cloneNode(event, true).leadingComments;

							return signature;
						})
						.filter((event) => !!event);

					const methods = (context.classMethods ?? [])
						.map((method) => {
							if (!t.isIdentifier(method.key)) return null;

							const parameters = (method.params ?? []) as t.Identifier[];

							const returnType = method.returnType as t.TSTypeAnnotation | undefined;

							const signature = t.tsMethodSignature(method.key, undefined, parameters, returnType);

							signature.leadingComments = t.cloneNode(method, true).leadingComments;

							return signature;
						})
						.filter((method) => !!method);

					const properties = (context.classProperties ?? [])
						.map((property) => {
							if (!t.isIdentifier(property.key)) return null;

							const key = property.key;

							// biome-ignore lint: TODO
							const readonly = property.readonly || !!property['returnType'];

							// biome-ignore lint: TODO
							const typeAnnotation = property.typeAnnotation || property['returnType'];

							const signature = t.tsPropertySignature(t.identifier(key.name), typeAnnotation);

							signature.readonly = readonly;

							signature.optional = property.optional ?? false;

							signature.leadingComments = t.cloneNode(property, true).leadingComments;

							return signature;
						})
						.filter((property) => !!property);

					const ast = template.default.ast(
						`
              // THE FOLLOWING TYPES HAVE BEEN ADDED AUTOMATICALLY

              export interface ${context.className}Attributes {
                ${attributes.map(print).join('')}
              }

              export interface ${context.className}Events {
                ${events.map(print).join('')}
              }

              export interface ${context.className}Methods {
                ${methods.map(print).join('')}
              }

              export interface ${context.className}Properties {
                ${properties.map(print).join('')}
              }

              export interface ${context.className}JSX extends ${context.className}Events, ${context.className}Properties { }
    
              declare global {
                interface ${context.elementInterfaceName} extends HTMLElement, ${context.className}Methods, ${context.className}Properties { }

                var ${context.elementInterfaceName}: {
                  prototype: ${context.elementInterfaceName};
                  new (): ${context.elementInterfaceName};
                };

                interface HTMLElementTagNameMap {
                  "${context.elementTagName}": ${context.elementInterfaceName};
                }
                
                namespace JSX {
                  interface IntrinsicElements {
                    "${context.elementTagName}": ${context.className}Events & ${context.className}Attributes & React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
                  }
                }

								interface ${pascalCase(namespace)}ElementsMap {
									"${context.elementTagName}": {
										attributes: ${context.className}Attributes;
										events: ${context.className}Events;
										methods: ${context.className}Methods;
										properties: ${context.className}Properties;
									};
								}
              }

              declare module "react" {
                namespace JSX {
                  interface IntrinsicElements {
                    "${context.elementTagName}": ${context.className}Events & ${context.className}Attributes & React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
                  }
                }
              }

							declare module "@htmlplus/element" {
								interface NamespaceElementsRegistry {
							    ${namespace}: ${pascalCase(namespace)}ElementsMap;
								}
							}

              export type ${context.className}Element = globalThis.${context.elementInterfaceName}
            `,
						{
							plugins: ['typescript'],
							preserveComments: true
						}
					);

					path.node.body.push(...ast);
				},
				// TODO
				TSTypeReference(path) {
					if (!t.isIdentifier(path.node.typeName)) return;

					if (path.node.typeName.name !== 'OverridesConfig') return;

					const property = path.findParent((p) => p.isTSPropertySignature());

					if (!property) return;

					if (!t.isTSPropertySignature(property.node)) return;

					// biome-ignore lint: TODO
					const name = (property.node.key as any).name || (property.node.key as any).extra.rawValue;

					if (!name) return;

					if (!path.node.typeParameters?.params) return;

					path.node.typeParameters.params[1] = t.tsTypeReference(
						t.identifier('Omit'),
						t.tsTypeParameterInstantiation([
							t.tsTypeReference(t.identifier(`${context.className}Properties`)),
							t.tsLiteralType(t.stringLiteral(name))
						])
					);

					path.skip();
				}
			});
		}

		context.script = print(ast);
	};

	return { name, run };
};
