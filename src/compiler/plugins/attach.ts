import t, { TSTypeAnnotation } from '@babel/types';

import * as CONSTANTS from '../../constants/index.js';
import { Context } from '../../types/index.js';
import { visitor } from '../utils/index.js';

const defaults: AttachOptions = {
  members: true,
  typings: true
};

export interface AttachOptions {
  members?: boolean;
  typings?: boolean;
}

export const attach = (options: AttachOptions) => {
  options = Object.assign({}, defaults, options);

  const name = 'attach';

  const next = (context: Context) => {
    if (options.members) {
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
    }

    if (options.typings) {
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
                        Object.assign(
                          t.tSPropertySignature(property.key, property.typeAnnotation as TSTypeAnnotation),
                          {
                            optional: property.optional,
                            leadingComments: property.leadingComments
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
    }
  };

  return {
    name,
    next
  };
};
