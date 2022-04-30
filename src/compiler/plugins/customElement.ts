import t, { TSTypeAnnotation } from '@babel/types';

import * as CONSTANTS from '../../constants/index.js';
import { Context } from '../../types/index.js';
import { print, visitor } from '../utils/index.js';

export const customElement = () => {
  const name = 'customElement';

  const next = (context: Context) => {
    // attach uhtml importer
    context.fileAST!.program.body.unshift(
      t.importDeclaration(
        [t.importSpecifier(t.identifier('html'), t.identifier('html'))],
        t.stringLiteral('@htmlplus/element/runtime')
      )
    );

    // jsx to uhtml syntax
    visitor(context.fileAST as any, {
      JSXAttribute: {
        exit(path) {
          if (path.node.value?.type == 'JSXExpressionContainer') {
            let node = path.node;

            if (path.node.name.name == 'ref') {
              node = t.jsxAttribute(
                path.node.name,
                t.jSXExpressionContainer(
                  t.arrowFunctionExpression(
                    [t.identifier('$element')],
                    t.assignmentExpression('=', path.node.value.expression, t.identifier('$element'))
                  )
                )
              );
            }

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
            return;
          } else {
            path.replaceWith(t.identifier('html`' + print(path.node) + '`'));
            return;
          }
        }
      },
      JSXFragment: {
        exit(path) {
          path.replaceWith(t.identifier(['html`', ...path.node.children.map((child) => print(child)), '`'].join('')));
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
      }
    });

    // attach members
    context.class!.body.body.unshift(
      t.classProperty(
        t.identifier(CONSTANTS.STATIC_MEMBERS),
        t.objectExpression([
          ...context.classProperties!.map((property) => {
            const type = (property as any).typeAnnotation?.typeAnnotation?.type;

            const elements: Array<any> = [];

            switch (type) {
              case 'TSBooleanKeyword':
                elements.push(t.stringLiteral(CONSTANTS.TYPE_BOOLEAN));
                break;

              case 'TSStringKeyword':
                elements.push(t.stringLiteral(CONSTANTS.TYPE_STRING));
                break;

              case 'TSNumberKeyword':
                elements.push(t.stringLiteral(CONSTANTS.TYPE_NUMBER));
                break;

              default:
                elements.push(t.nullLiteral());
                break;
            }

            if (property.value) elements.push(property.value);

            return t.objectProperty(t.identifier(property.key['name']), t.arrayExpression(elements));
          }),
          ...context.classMethods!.map((method) => {
            const elements: Array<any> = [t.stringLiteral(CONSTANTS.TYPE_FUNCTION)];
            return t.objectProperty(t.identifier(method.key['name']), t.arrayExpression(elements));
          })
        ]),
        undefined,
        undefined,
        undefined,
        true
      )
    );

    // attach typings
    visitor(context.fileAST as any, {
      Program(path) {
        path.node.body.push(
          Object.assign(
            t.tsModuleDeclaration(
              t.identifier('global'),
              t.tsModuleBlock([
                t.tsInterfaceDeclaration(
                  t.identifier(context.componentInterfaceName!),
                  null,
                  [],
                  t.tsInterfaceBody([
                    ...context.classProperties!.map((property) =>
                      Object.assign(t.tSPropertySignature(property.key, property.typeAnnotation as TSTypeAnnotation), {
                        optional: property.optional,
                        leadingComments: property.leadingComments
                      })
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
                )
              ])
            ),
            {
              declare: true,
              global: true
            }
          )
        );
        path.node.body.push(
          t.exportNamedDeclaration(
            t.tsInterfaceDeclaration(
              // TODO
              t.identifier(context.componentClassName! + 'JSX'),
              null,
              [],
              t.tsInterfaceBody([
                ...context.classProperties!.map((property) =>
                  Object.assign(t.tSPropertySignature(property.key, property.typeAnnotation as TSTypeAnnotation), {
                    optional: property.optional,
                    leadingComments: property.leadingComments
                  })
                ),
                ...context.classEvents!.map((event) =>
                  Object.assign(
                    t.tSPropertySignature(
                      event.key,
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
                      leadingComments: event.leadingComments
                    }
                  )
                )
              ])
            )
          )
        );
      }
    });

    context.script = print(context.fileAST!);
  };

  return {
    name,
    next
  };
};
