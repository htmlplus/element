import t from '@babel/types';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { Context } from '../../types/index.js';
import { print, visitor } from '../../utils/index.js';

export const uhtml = () => {

  const name = 'uhtml';

  const next = (context: Context) => {

    context.fileAST?.program.body.unshift(
      t.importDeclaration(
        [
          t.importSpecifier(
            t.identifier('define'),
            t.identifier('define'),
          ),
          t.importSpecifier(
            t.identifier('html'),
            t.identifier('html'),
          ),
          t.importSpecifier(
            t.identifier('proxy'),
            t.identifier('proxy'),
          )
        ],
        t.stringLiteral(
          resolve(
            dirname(
              fileURLToPath(import.meta.url)
            ),
            'utils.js'
          )
        )
      )
    )

    context.fileAST?.program.body.push(
      t.expressionStatement(
        t.callExpression(
          t.identifier('define'),
          [
            t.stringLiteral(context.componentTag || ''),
            t.callExpression(
              t.identifier('proxy'),
              [
                t.identifier(context.className as any)
              ]
            )
          ]
        )
      )
    )

    visitor(context.fileAST as any, {
      JSXAttribute(path) {

        if (!t.isJSXExpressionContainer(path.node.value)) return;

        if (path.node.name.name == 'ref') {

          path.replaceWith(
            t.jsxAttribute(
              path.node.name,
              t.jSXExpressionContainer(
                t.arrowFunctionExpression(
                  [
                    t.identifier('$element')
                  ],
                  t.assignmentExpression(
                    '=',
                    path.node.value.expression,
                    t.identifier('$element')
                  )
                )
              )
            )
          );

          path.skip();
        }
      },
      ReturnStatement: {
        exit(path) {

          if (path.getFunctionParent(path).node !== context.classRender) return;

          // TODO 
          const markup = print(path.node.argument)
            .replace(/<>/g, '')
            .replace(/<\/>/g, '')
            .replace(/\/\*\$\*\//g, '$')
            .replace(/={/g, '=${');

          path.replaceWith(
            t.returnStatement(
              t.taggedTemplateExpression(
                t.identifier('html'),
                t.templateLiteral(
                  [
                    t.templateElement({
                      raw: markup
                    })
                  ],
                  []
                )
              )
            )
          )

          path.skip();
        }
      }
    })
  }

  return {
    name,
    next,
  }
}