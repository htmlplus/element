import t, { TSTypeAnnotation } from '@babel/types';
import { pascalCase } from 'change-case';

import * as CONSTANTS from '../../configs/constants.js';
import { Context } from '../../types';
import { visitor } from '../utils';

const defaults: AttachOptions = {
  dependencies: true,
  members: true,
  styles: true,
  typings: true
};

export interface AttachOptions {
  dependencies?: boolean;
  members?: boolean;
  styles?: boolean;
  typings?: boolean;
}

export const attach = (options: AttachOptions) => {
  options = Object.assign({}, defaults, options);

  const name = 'attach';

  const next = (context: Context) => {
    // TODO
    if (options.dependencies) {
    }

    if (options.styles && context.styleParsed)
      context.class!.body.body.unshift(
        t.classProperty(
          t.identifier(CONSTANTS.TOKEN_STATIC_STYLES),
          t.stringLiteral(context.styleParsed),
          undefined,
          null,
          undefined,
          true
        )
      );

    if (options.members) {
      context.class!.body.body.unshift(
        t.classProperty(
          t.identifier(CONSTANTS.TOKEN_STATIC_MEMBERS),
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
      const className = pascalCase(context.componentTag!.split('-').slice(1).join('-'));

      const elementName = `HTML${className}Element`;

      visitor(context.fileAST as any, {
        Program(path) {
          path.node.body.push(
            Object.assign(
              t.tsModuleDeclaration(
                t.identifier('global'),
                t.tsModuleBlock([
                  t.tsInterfaceDeclaration(
                    t.identifier(elementName),
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
                      Object.assign(t.identifier(elementName), {
                        typeAnnotation: t.tSTypeAnnotation(
                          t.tSTypeLiteral([
                            t.tSPropertySignature(
                              t.identifier('prototype'),
                              t.tsTypeAnnotation(t.tSTypeReference(t.identifier(elementName)))
                            ),
                            t.tSConstructSignatureDeclaration(
                              null,
                              [],
                              t.tSTypeAnnotation(t.tSTypeReference(t.identifier(elementName)))
                            )
                          ])
                        )
                      })
                    )
                  ]),
                  t.tsInterfaceDeclaration(
                    t.identifier(className),
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
                  t.tsInterfaceDeclaration(
                    t.identifier('HTMLElementTagNameMap'),
                    null,
                    [],
                    t.tsInterfaceBody([
                      t.tSPropertySignature(
                        t.stringLiteral(context.componentTag!),
                        t.tSTypeAnnotation(t.tSIntersectionType([t.tSTypeReference(t.identifier(className))]))
                      )
                    ])
                  ),
                  t.exportNamedDeclaration(
                    t.tSModuleDeclaration(
                      t.identifier('JSX'),
                      t.tsModuleBlock([
                        t.tsInterfaceDeclaration(
                          t.identifier('IntrinsicElements'),
                          undefined,
                          undefined,
                          t.tsInterfaceBody([
                            t.tsPropertySignature(
                              t.stringLiteral(context.componentTag!),
                              t.tsTypeAnnotation(t.tsTypeReference(t.identifier(className)))
                            )
                          ])
                        )
                      ])
                    )
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
  };

  return {
    name,
    next
  };
};
