import template from '@babel/template';
import t from '@babel/types';
import { camelCase, kebabCase, pascalCase } from 'change-case';
import * as CONSTANTS from '../../constants/index.js';
import { addDependency, getType, print, visitor } from '../utils/index.js';
export const CUSTOM_ELEMENT_OPTIONS = {
    prefix: undefined,
    typings: true
};
// TODO: support {variable && jsxElement}
export const customElement = (options) => {
    const name = 'customElement';
    options = Object.assign({}, CUSTOM_ELEMENT_OPTIONS, options);
    const run = (context) => {
        const ast = t.cloneNode(context.fileAST, true);
        context.elementTagName = `${options.prefix || ''}${context.elementKey}`;
        context.elementInterfaceName = `HTML${pascalCase(context.elementTagName)}Element`;
        // attach tag name
        visitor(ast, {
            ClassDeclaration(path) {
                const { body, id } = path.node;
                if (id.name != context.className)
                    return;
                const node = t.classProperty(t.identifier(CONSTANTS.STATIC_TAG), t.stringLiteral(context.elementTagName), undefined, undefined, undefined, true);
                t.addComment(node, 'leading', CONSTANTS.COMMENT_AUTO_ADDED, true);
                body.body.unshift(node);
            }
        });
        // attach style mapper for 'style' attribute
        visitor(ast, {
            JSXAttribute(path) {
                const { name, value } = path.node;
                if (name.name != 'style')
                    return;
                if (!value)
                    return;
                if (value.type != 'JSXExpressionContainer')
                    return;
                const { local } = addDependency(path, CONSTANTS.UTILS_PATH, CONSTANTS.UTILS_STYLES_LOCAL, CONSTANTS.UTILS_STYLES_IMPORTED);
                // TODO: remove 'local!'
                path.replaceWith(t.jsxAttribute(t.jsxIdentifier('style'), t.jsxExpressionContainer(t.callExpression(t.identifier(local), [value.expression]))));
                path.skip();
            }
        });
        // replace 'className' attribute with 'class'
        visitor(ast, {
            JSXAttribute(path) {
                const { name, value } = path.node;
                if (name.name != 'className')
                    return;
                const hasClass = path.parentPath.node.attributes.some((attribute) => {
                    var _a;
                    return ((_a = attribute.name) === null || _a === void 0 ? void 0 : _a.name) == 'class';
                });
                if (hasClass)
                    return path.remove();
                path.replaceWith(t.jsxAttribute(t.jsxIdentifier('class'), value));
            }
        });
        // TODO
        visitor(ast, {
            JSXAttribute(path) {
                const { name, value } = path.node;
                const key = ['tabIndex', 'viewBox'];
                if (!key.includes(name.name))
                    return;
                path.replaceWith(t.jsxAttribute(t.jsxIdentifier(name.name.toLowerCase()), value));
            }
        });
        // TODO
        // convert 'jsx' to 'uhtml' syntax
        visitor(ast, {
            enter(path) {
                const { type } = path.node;
                if (!['JSXElement', 'JSXFragment'].includes(type))
                    return;
                const TODO = (node, attributes) => {
                    const { local } = addDependency(path, CONSTANTS.UTILS_PATH, CONSTANTS.UTILS_ATTRIBUTES_LOCAL, CONSTANTS.UTILS_ATTRIBUTES_IMPORTED);
                    return t.callExpression(t.identifier(local), [
                        node,
                        t.arrayExpression(attributes.map((attribute) => {
                            var _a;
                            switch (attribute.type) {
                                case 'JSXSpreadAttribute':
                                    return attribute.argument;
                                default:
                                    return t.objectExpression([
                                        t.objectProperty(t.stringLiteral(attribute.name.name), ((_a = attribute.value) === null || _a === void 0 ? void 0 : _a.type) == 'JSXExpressionContainer'
                                            ? attribute.value.expression
                                            : attribute.value || t.booleanLiteral(true))
                                    ]);
                            }
                        }))
                    ]);
                };
                const render = (node) => {
                    switch (node.type) {
                        case 'JSXElement':
                            const attributes = node.openingElement.attributes;
                            const isHost = node.openingElement.name.name == CONSTANTS.ELEMENT_HOST_NAME;
                            // TODO
                            if (isHost) {
                                const children = node.children.map(render).flat();
                                if (!attributes.length)
                                    return children;
                                return [TODO(t.thisExpression(), attributes), ...children];
                            }
                            const name = node.openingElement.name.name;
                            const children = node.children.map(render).flat();
                            const parts = [];
                            parts.push('<', name);
                            const hasSpreadAttribute = attributes.some((attribute) => {
                                return attribute.type == 'JSXSpreadAttribute';
                            });
                            if (hasSpreadAttribute) {
                                parts.push(' ', TODO(t.identifier('TODO'), attributes));
                            }
                            else {
                                for (const attribute of attributes) {
                                    switch (attribute.type) {
                                        case 'JSXAttribute':
                                            parts.push(' ', attribute.name.name);
                                            if (!attribute.value)
                                                continue;
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
                        case 'JSXFragment':
                            return node.children.map(render).flat();
                        case 'JSXText':
                            return [node.extra.raw];
                        case 'JSXExpressionContainer':
                            if (node.expression.type == 'JSXEmptyExpression')
                                return [];
                            return [node.expression];
                    }
                };
                const transform = (parts) => {
                    const quasis = [];
                    const expressions = [];
                    let i = 0;
                    while (i < parts.length + 1) {
                        let quasi = '';
                        while (typeof parts[i] == 'string') {
                            quasi += parts[i].replace(/[\\`]/g, (s) => `\\${s}`);
                            i += 1;
                        }
                        quasis.push(t.templateElement({ raw: quasi }));
                        if (parts[i] != null)
                            expressions.push(parts[i]);
                        i += 1;
                    }
                    const templateLiteral = t.templateLiteral(quasis, expressions);
                    // TODO
                    // if (!expressions.length) return template;
                    const { local } = addDependency(path, CONSTANTS.UTILS_PATH, CONSTANTS.UTILS_HTML_LOCAL, CONSTANTS.UTILS_HTML_IMPORTED, true);
                    return t.taggedTemplateExpression(t.identifier(local), templateLiteral);
                };
                path.replaceWith(transform(render(path.node)));
            }
        });
        // add type to properties
        visitor(ast, {
            Decorator(path) {
                var _a, _b;
                const { expression } = path.node;
                if (((_a = expression.callee) === null || _a === void 0 ? void 0 : _a.name) != CONSTANTS.DECORATOR_PROPERTY)
                    return;
                let type = 0;
                const extract = (input) => {
                    var _a;
                    switch (input === null || input === void 0 ? void 0 : input.type) {
                        case 'BooleanLiteral':
                            type |= CONSTANTS.TYPE_BOOLEAN;
                            break;
                        case 'NumericLiteral':
                            type |= CONSTANTS.TYPE_NUMBER;
                            break;
                        case 'StringLiteral':
                            type |= CONSTANTS.TYPE_ENUM;
                            break;
                        case 'TSArrayType':
                            type |= CONSTANTS.TYPE_ARRAY;
                            break;
                        case 'TSBooleanKeyword':
                            type |= CONSTANTS.TYPE_BOOLEAN;
                            break;
                        case 'TSLiteralType':
                            extract(input.literal);
                            break;
                        case 'TSNullKeyword':
                            type |= CONSTANTS.TYPE_NULL;
                            break;
                        case 'TSNumberKeyword':
                            type |= CONSTANTS.TYPE_NUMBER;
                            break;
                        case 'TSObjectKeyword':
                            type |= CONSTANTS.TYPE_OBJECT;
                            break;
                        case 'TSStringKeyword':
                            type |= CONSTANTS.TYPE_STRING;
                            break;
                        case 'TSTupleType':
                            type |= CONSTANTS.TYPE_ARRAY;
                            break;
                        case 'TSTypeLiteral':
                            type |= CONSTANTS.TYPE_OBJECT;
                            break;
                        case 'TSTypeReference':
                            if (!input.typeName)
                                break;
                            switch (input.typeName.name) {
                                case 'Array':
                                    type |= CONSTANTS.TYPE_ARRAY;
                                    break;
                                case 'Boolean':
                                    type |= CONSTANTS.TYPE_BOOLEAN;
                                    break;
                                case 'bool':
                                    type |= CONSTANTS.TYPE_BOOLEAN;
                                    break;
                                case 'Date':
                                    type |= CONSTANTS.TYPE_DATE;
                                    break;
                                case 'Number':
                                    type |= CONSTANTS.TYPE_NUMBER;
                                    break;
                                case 'Object':
                                    type |= CONSTANTS.TYPE_OBJECT;
                                    break;
                            }
                            break;
                        case 'TSUnionType':
                            input.types.forEach(extract);
                            break;
                    }
                    // TODO
                    if ((input === null || input === void 0 ? void 0 : input.type) == 'TSParenthesizedType' &&
                        ((_a = input === null || input === void 0 ? void 0 : input.typeAnnotation) === null || _a === void 0 ? void 0 : _a.type) == 'TSIntersectionType') {
                        let types = input.types || input.typeAnnotation.types;
                        if (types.length != 2)
                            return;
                        types = types.filter((type) => type.type != 'TSTypeLiteral');
                        if (types.length != 1)
                            return;
                        extract(types[0]);
                    }
                };
                extract(getType(context.directoryPath, ast, (_b = path.parentPath.node.typeAnnotation) === null || _b === void 0 ? void 0 : _b.typeAnnotation));
                if (!expression.arguments.length) {
                    expression.arguments.push(t.objectExpression([]));
                }
                const [argument] = expression.arguments;
                argument.properties = argument.properties.filter((property) => {
                    return property.key.name != CONSTANTS.DECORATOR_PROPERTY_TYPE;
                });
                argument.properties.push(t.objectProperty(t.identifier(CONSTANTS.DECORATOR_PROPERTY_TYPE), t.numericLiteral(type)));
            }
        });
        // attach typings
        if (options.typings) {
            visitor(ast, {
                Program(path) {
                    const attributes = context.classProperties.map((property) => {
                        const key = property.key;
                        const typeAnnotation = property.typeAnnotation;
                        return Object.assign(t.tSPropertySignature(t.stringLiteral(kebabCase(key.name)), typeAnnotation), {
                            optional: property.optional,
                            leadingComments: t.cloneNode(property, true).leadingComments
                        });
                    });
                    const events = context.classEvents.map((event) => {
                        var _a;
                        const key = event.key;
                        const typeAnnotation = event.typeAnnotation;
                        return Object.assign(t.tSPropertySignature(t.identifier(camelCase('on-' + key.name)), t.tsTypeAnnotation(t.tsFunctionType(undefined, [
                            Object.assign({}, t.identifier('event'), {
                                typeAnnotation: t.tsTypeAnnotation(t.tsTypeReference(t.identifier('CustomEvent'), (_a = typeAnnotation === null || typeAnnotation === void 0 ? void 0 : typeAnnotation['typeAnnotation']) === null || _a === void 0 ? void 0 : _a.typeParameters))
                            })
                        ], t.tsTypeAnnotation(t.tsVoidKeyword())))), {
                            optional: true,
                            leadingComments: t.cloneNode(event, true).leadingComments
                        });
                    });
                    const methods = context.classMethods.map((method) => {
                        return Object.assign(t.tsMethodSignature(method.key, undefined, method.params, // TODO
                        method.returnType // TODO
                        ), {
                            leadingComments: t.cloneNode(method, true).leadingComments
                        });
                    });
                    const properties = context.classProperties.map((property) => {
                        const key = property.key;
                        const typeAnnotation = property.typeAnnotation;
                        return Object.assign(t.tSPropertySignature(t.identifier(key.name), typeAnnotation), {
                            optional: property.optional,
                            leadingComments: t.cloneNode(property, true).leadingComments
                        });
                    });
                    // prettier-ignore
                    const ast = template.default.ast(`
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
                    "${context.elementTagName}": ${context.className}Events & ${context.className}Attributes & {
                      [key: string]: any;
                    };
                  }
                }
              }

              export type ${context.className}Element = globalThis.${context.elementInterfaceName}
            `, {
                        plugins: ['typescript'],
                        preserveComments: true
                    });
                    path.node.body.push(...ast);
                }
            });
        }
        context.script = print(ast);
    };
    return { name, run };
};
