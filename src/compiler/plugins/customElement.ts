import t, { TSTypeAnnotation } from '@babel/types';
import { pascalCase } from 'change-case';

import * as CONSTANTS from '../../constants/index.js';
import { Context, Plugin } from '../../types';
import { addDependency, getType, print, visitor } from '../utils/index.js';

export const CUSTOM_ELEMENT_OPTIONS: Partial<CustomElementOptions> = {
  // prefix: undefined,
  typings: true
};

export interface CustomElementOptions {
  // prefix?: string;
  typings?: boolean;
}

// TODO: support {variable && jsxElement}
export const customElement = (options?: CustomElementOptions): Plugin => {
  const name = 'customElement';

  options = Object.assign({}, CUSTOM_ELEMENT_OPTIONS, options);

  const run = (context: Context) => {
    const ast = t.cloneNode(context.fileAST!, true);

    // attaches name
    visitor(ast, {
      ClassDeclaration(path) {
        const { body, id } = path.node;

        if (id.name != context.className) return;

        const node = t.classProperty(
          t.identifier(CONSTANTS.STATIC_TAG),
          t.stringLiteral(context.componentTag!),
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
          CONSTANTS.PACKAGE_NAME,
          CONSTANTS.UTIL_STYLE_MAPPER,
          CONSTANTS.UTIL_STYLE_MAPPER
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
        const hasClass = path.parentPath.node.attributes.some((attribute) => attribute.name.name == 'class');
        if (hasClass) return path.remove();
        path.replaceWith(t.jsxAttribute(t.jsxIdentifier('class'), value));
      }
    });

    // converts 'jsx' to 'uhtml' syntax
    visitor(ast, {
      JSXAttribute: {
        exit(path) {
          if (path.node.value?.type == 'JSXExpressionContainer') {
            const node = path.node;

            path.replaceWith(t.jsxIdentifier(print(node).replace('={', '=${')));

            path.skip();

            return;
          }
        }
      },
      JSXElement: {
        exit(path) {
          if (path.parent.type == 'JSXElement' || path.parent.type == 'JSXFragment') {
            path.replaceWith(t.identifier(print(path.node)));
          } else {
            path.replaceWith(t.memberExpression(t.identifier('uhtml'), t.identifier(`html\`${print(path.node)}\``)));
          }
        }
      },
      JSXFragment: {
        exit(path) {
          path.replaceWith(
            t.memberExpression(
              t.identifier('uhtml'),
              t.identifier(['html`', ...path.node.children.map((child) => print(child)), '`'].join(''))
            )
          );
        }
      },
      JSXExpressionContainer: {
        exit(path) {
          if (path.parent.type == 'JSXElement' || path.parent.type == 'JSXFragment') {
            path.replaceWith(t.identifier('$' + print(path.node)));
            return;
          }
        }
      },
      JSXSpreadAttribute: {
        enter(path) {
          // TODO
          path.replaceWith(t.jsxAttribute(t.jsxIdentifier('.dataset'), t.jsxExpressionContainer(path.node.argument)));
        }
      },
      Program(path) {
        const { node } = addDependency(path, CONSTANTS.VENDOR_UHTML_PATH, 'uhtml');
        t.addComment(node, 'leading', CONSTANTS.COMMENT_AUTO_ADDED_DEPENDENCY, true);
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
                    t.identifier(context.componentInterfaceName!),
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
                      Object.assign(t.identifier(context.componentInterfaceName!), {
                        typeAnnotation: t.tSTypeAnnotation(
                          t.tSTypeLiteral([
                            t.tSPropertySignature(
                              t.identifier('prototype'),
                              t.tsTypeAnnotation(t.tSTypeReference(t.identifier(context.componentInterfaceName!)))
                            ),
                            t.tSConstructSignatureDeclaration(
                              null,
                              [],
                              t.tSTypeAnnotation(t.tSTypeReference(t.identifier(context.componentInterfaceName!)))
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
                        t.stringLiteral(context.componentTag!),
                        t.tSTypeAnnotation(
                          t.tSIntersectionType([t.tSTypeReference(t.identifier(context.componentInterfaceName!))])
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
                            t.stringLiteral(context.componentTag!),
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
        }
      });
    }

    // TODO
    context.script = print(ast);
  };

  return { name, run };
};
