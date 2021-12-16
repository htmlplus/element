import t from '@babel/types';
import { TSTypeAnnotation } from '@babel/types';
import { pascalCase } from 'change-case';
import { Context } from '../types/index.js';
import { visitor } from '../utils/index.js';

export interface TypingOptions {
    prefix?: string;
}

export const typing = (options: TypingOptions) => {

    const name = 'typing';

    const next = (context: Context) => {

        // TODO
        const v5 = pascalCase(options.prefix || '') + context.name;
        const v6 = `HTML${v5}Element`;

        visitor(context.ast as any, {
            Program(path) {
                path.node.body.push(
                    Object.assign(
                        t.tsModuleDeclaration(
                            t.identifier('global'),
                            t.tsModuleBlock(
                                [
                                    t.tsInterfaceDeclaration(
                                        t.identifier(v6),
                                        null,
                                        [],
                                        t.tsInterfaceBody([
                                            ...context.properties.map((property) => Object.assign(
                                                t.tSPropertySignature(
                                                    property.key,
                                                    property.typeAnnotation as TSTypeAnnotation
                                                ),
                                                {
                                                    optional: property.optional,
                                                    leadingComments: property.leadingComments
                                                }
                                            ))
                                        ])
                                    ),
                                    t.variableDeclaration(
                                        'var',
                                        [
                                            t.variableDeclarator(
                                                Object.assign(
                                                    t.identifier(v6),
                                                    {
                                                        typeAnnotation: t.tSTypeAnnotation(
                                                            t.tSTypeLiteral(
                                                                [
                                                                    t.tSPropertySignature(
                                                                        t.identifier('prototype'),
                                                                        t.tsTypeAnnotation(
                                                                            t.tSTypeReference(t.identifier(v6))
                                                                        )
                                                                    ),
                                                                    t.tSConstructSignatureDeclaration(
                                                                        null,
                                                                        [],
                                                                        t.tSTypeAnnotation(
                                                                            t.tSTypeReference(t.identifier(v6))
                                                                        )
                                                                    )
                                                                ]
                                                            )
                                                        )
                                                    }
                                                )
                                            )
                                        ]
                                    ),
                                    t.tsInterfaceDeclaration(
                                        t.identifier(v5),
                                        null,
                                        [],
                                        t.tsInterfaceBody([
                                            ...context.properties.map((property) => Object.assign(
                                                t.tSPropertySignature(
                                                    property.key,
                                                    property.typeAnnotation as TSTypeAnnotation
                                                ),
                                                {
                                                    optional: property.optional,
                                                    leadingComments: property.leadingComments
                                                }
                                            ))
                                        ])
                                    ),
                                    t.tsInterfaceDeclaration(
                                        t.identifier('HTMLElementTagNameMap'),
                                        null,
                                        [],
                                        t.tsInterfaceBody(
                                            [
                                                t.tSPropertySignature(
                                                    t.stringLiteral(context.tag),
                                                    t.tSTypeAnnotation(
                                                        t.tSIntersectionType(
                                                            [
                                                                t.tSTypeReference(
                                                                    t.identifier(v5)
                                                                )
                                                            ]
                                                        )
                                                    )
                                                )
                                            ]
                                        )
                                    )
                                ]
                            )
                        ),
                        {
                            declare: true,
                            global: true,
                        }
                    )
                )
            }
        })
    }

    return {
        name,
        next,
    }
}