import t, { TSTypeAnnotation } from '@babel/types';
import { pascalCase } from 'change-case';

import * as CONSTANTS from '../../constants/index.js';
import { Context, Plugin } from '../../types';
import { addDependency, getType, print, visitor } from '../utils/index.js';

export const CUSTOM_ELEMENT_OPTIONS: Partial<CustomElementOptions> = {
  prefix: undefined,
  typings: true
};

export interface CustomElementOptions {
  prefix?: string;
  typings?: boolean;
}

// TODO: support {variable && jsxElement}
export const customElement = (options?: CustomElementOptions): Plugin => {
  const name = 'customElement';

  options = Object.assign({}, CUSTOM_ELEMENT_OPTIONS, options);

  const run = (context: Context) => {
    const ast = t.cloneNode(context.fileAST!, true);

    // TODO
    const tag = (options?.prefix || '') + context.componentKey!;
    const componentInterfaceName = `HTML${pascalCase(tag)}Element`;

    // attaches name
    visitor(ast, {
      ClassDeclaration(path) {
        const { body, id } = path.node;

        if (id.name != context.className) return;

        const node = t.classProperty(
          t.identifier(CONSTANTS.STATIC_TAG),
          t.stringLiteral(tag),
          undefined,
          undefined,
          undefined,
          true
        );

        t.addComment(node, 'leading', CONSTANTS.COMMENT_AUTO_ADDED_PROPERTY, true);

        body.body.unshift(node);
      }
    });

    // attaches style mapper for 'style' attribute
    visitor(ast, {
      JSXAttribute(path) {
        const { name, value } = path.node;

        if (name.name != 'style') return;

        if (!value) return;

        if (value.type != 'JSXExpressionContainer') return;

        const { local } = addDependency(
          path,
          CONSTANTS.UTILS_PATH,
          CONSTANTS.UTILS_STYLES_LOCAL,
          CONSTANTS.UTILS_STYLES_IMPORTED
        );

        // TODO: remove 'local!'
        path.replaceWith(
          t.jsxAttribute(
            t.jsxIdentifier('style'),
            t.jsxExpressionContainer(t.callExpression(t.identifier(local!), [value.expression]))
          )
        );

        path.skip();
      }
    });

    // replaces 'className' attribute with 'class'
    visitor(ast, {
      JSXAttribute(path) {
        const { name, value } = path.node;
        if (name.name != 'className') return;
        const hasClass = path.parentPath.node.attributes.some((attribute) => attribute.name?.name == 'class');
        if (hasClass) return path.remove();
        path.replaceWith(t.jsxAttribute(t.jsxIdentifier('class'), value));
      }
    });

    // TODO
    visitor(ast, {
      JSXAttribute(path) {
        const { name, value } = path.node;

        const key = ['tabIndex', 'viewBox'];

        if (!key.includes(name.name)) return;

        path.replaceWith(t.jsxAttribute(t.jsxIdentifier(name.name.toLowerCase()), value));
      }
    });

    // converts 'jsx' to 'uhtml' syntax
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
          return t.callExpression(t.identifier(local!), [
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
                        attribute.value?.type == 'JSXExpressionContainer'
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
            case 'JSXElement':
              const attributes = node.openingElement.attributes;

              const isHost = node.openingElement.name.name == 'host';

              // TODO
              if (isHost) {
                const children = node.children.map(render).flat();

                if (!attributes.length) return children;

                const { local } = addDependency(
                  path,
                  CONSTANTS.UTILS_PATH,
                  CONSTANTS.UTILS_HOST_LOCAL,
                  CONSTANTS.UTILS_HOST_IMPORTED
                );

                const host = t.callExpression(t.identifier(local!), [t.thisExpression()]);

                return [TODO(host, attributes), ...children];
              }

              const name = node.openingElement.name.name;

              const children = node.children.map(render).flat();

              const parts: any[] = [];

              parts.push('<', name);

              const hasSpreadAttribute = attributes.some((attribute) => attribute.type == 'JSXSpreadAttribute');

              if (hasSpreadAttribute) {
                parts.push(' ', TODO(t.identifier('TODO'), attributes));
              } else {
                for (const attribute of attributes) {
                  switch (attribute.type) {
                    case 'JSXAttribute':
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

            case 'JSXFragment':
              return node.children.map(render).flat();

            case 'JSXText':
              return [node.extra.raw];

            case 'JSXExpressionContainer':
              if (node.expression.type == 'JSXEmptyExpression') return [];
              return [node.expression];
          }
        };

        const transform = (parts) => {
          const quasis: any = [];

          const expressions: any = [];

          let i = 0;

          while (i < parts.length + 1) {
            let quasi = '';

            while (typeof parts[i] == 'string') {
              quasi += parts[i].replace(/[\\`]/g, (s) => `\\${s}`);
              i += 1;
            }

            quasis.push(t.templateElement({ raw: quasi }));

            if (parts[i] != null) expressions.push(parts[i]);

            i += 1;
          }

          const template = t.templateLiteral(quasis, expressions);

          // TODO
          // if (!expressions.length) return template;

          const { local } = addDependency(
            path,
            CONSTANTS.UTILS_PATH,
            CONSTANTS.UTILS_HTML_LOCAL,
            CONSTANTS.UTILS_HTML_IMPORTED
          );

          return t.taggedTemplateExpression(t.identifier(local!), template);
        };

        path.replaceWith(transform(render(path.node)));
      }
    });

    // adds type to properties
    visitor(ast, {
      Decorator(path) {
        const { expression } = path.node;

        if (expression.callee?.name != CONSTANTS.DECORATOR_PROPERTY) return;

        let type = 0;

        const extract = (input) => {
          switch (input?.type) {
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
              if (!input.typeName) break;
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
          if (input?.type == 'TSParenthesizedType' && input?.typeAnnotation?.type == 'TSIntersectionType') {
            let types = input.types || input.typeAnnotation.types;

            if (types.length != 2) return;

            types = types.filter((type) => type.type != 'TSTypeLiteral');

            if (types.length != 1) return;

            extract(types[0]);
          }
        };

        extract(getType(context.directoryPath!, ast, path.parentPath.node.typeAnnotation?.typeAnnotation));

        if (!expression.arguments.length) {
          expression.arguments.push(t.objectExpression([]));
        }

        const [argument] = expression.arguments;

        argument.properties = argument.properties.filter((property) => {
          return property.key.name != CONSTANTS.STATIC_MEMBERS_TYPE;
        });

        argument.properties.push(t.objectProperty(t.identifier(CONSTANTS.STATIC_MEMBERS_TYPE), t.numericLiteral(type)));
      }
    });

    // attaches typings
    if (options?.typings) {
      visitor(ast, {
        Program(path) {
          const { body } = path.node;
          body.push(
            t.exportNamedDeclaration(
              t.tsInterfaceDeclaration(
                // TODO
                t.identifier(context.className! + 'JSX'),
                null,
                [],
                t.tsInterfaceBody([
                  ...context.classProperties!.map((property) =>
                    Object.assign(t.tSPropertySignature(property.key, property.typeAnnotation as TSTypeAnnotation), {
                      optional: property.optional,
                      leadingComments: t.cloneNode(property, true).leadingComments
                    })
                  ),
                  ...context.classEvents!.map((event) =>
                    Object.assign(
                      t.tSPropertySignature(
                        t.identifier('on' + pascalCase(event.key['name'])),
                        t.tsTypeAnnotation(
                          t.tsFunctionType(
                            undefined,
                            [
                              Object.assign({}, t.identifier('event'), {
                                typeAnnotation: t.tsTypeAnnotation(
                                  t.tsTypeReference(
                                    t.identifier('CustomEvent'),
                                    event.typeAnnotation?.['typeAnnotation']?.typeParameters
                                  )
                                )
                              })
                            ],
                            t.tsTypeAnnotation(t.tsVoidKeyword())
                          )
                        )
                      ),
                      {
                        optional: true,
                        leadingComments: t.cloneNode(event, true).leadingComments
                      }
                    )
                  )
                ])
              )
            )
          );
          body.push(
            Object.assign(
              t.tsModuleDeclaration(
                t.identifier('global'),
                t.tsModuleBlock([
                  t.tsInterfaceDeclaration(
                    t.identifier(componentInterfaceName),
                    null,
                    [
                      t.tSExpressionWithTypeArguments(t.identifier('HTMLElement')) // TODO
                    ],
                    t.tsInterfaceBody([
                      ...context.classProperties!.map((property) =>
                        Object.assign(
                          t.tSPropertySignature(property.key, property.typeAnnotation as TSTypeAnnotation),
                          {
                            optional: property.optional,
                            leadingComments: t.cloneNode(property, true).leadingComments
                          }
                        )
                      )
                    ])
                  ),
                  t.variableDeclaration('var', [
                    t.variableDeclarator(
                      Object.assign(t.identifier(componentInterfaceName), {
                        typeAnnotation: t.tSTypeAnnotation(
                          t.tSTypeLiteral([
                            t.tSPropertySignature(
                              t.identifier('prototype'),
                              t.tsTypeAnnotation(t.tSTypeReference(t.identifier(componentInterfaceName)))
                            ),
                            t.tSConstructSignatureDeclaration(
                              null,
                              [],
                              t.tSTypeAnnotation(t.tSTypeReference(t.identifier(componentInterfaceName)))
                            )
                          ])
                        )
                      })
                    )
                  ]),
                  t.tsInterfaceDeclaration(
                    t.identifier('HTMLElementTagNameMap'),
                    null,
                    [],
                    t.tsInterfaceBody([
                      t.tSPropertySignature(
                        t.stringLiteral(tag),
                        t.tSTypeAnnotation(
                          t.tSIntersectionType([t.tSTypeReference(t.identifier(componentInterfaceName))])
                        )
                      )
                    ])
                  ),
                  t.tSModuleDeclaration(
                    t.identifier('JSX'),
                    t.tSModuleBlock([
                      t.tSInterfaceDeclaration(
                        t.identifier('IntrinsicElements'),
                        undefined,
                        undefined,
                        t.tSInterfaceBody([
                          t.tSPropertySignature(
                            t.stringLiteral(tag),
                            t.tSTypeAnnotation(
                              t.tSIntersectionType([
                                t.tSTypeReference(t.identifier(context.className! + 'JSX')),
                                t.tSTypeLiteral([
                                  t.tSIndexSignature(
                                    [
                                      Object.assign({}, t.identifier('key'), {
                                        typeAnnotation: t.tSTypeAnnotation(t.tSStringKeyword())
                                      })
                                    ],
                                    t.tSTypeAnnotation(t.tSAnyKeyword())
                                  )
                                ])
                              ])
                            )
                          )
                        ])
                      )
                    ])
                  )
                ])
              ),
              {
                declare: true,
                global: true
              }
            )
          );
          body.push(
            t.exportNamedDeclaration(
              t.tsTypeAliasDeclaration(
                t.identifier(`${context.className}Element`),
                undefined,
                t.tsTypeReference(t.tsQualifiedName(t.identifier('globalThis'), t.identifier(componentInterfaceName)))
              )
            )
          );
        }
      });
    }

    // TODO
    context.script = print(ast);
  };

  return { name, run };
};
