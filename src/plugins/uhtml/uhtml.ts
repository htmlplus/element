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
      JSXAttribute: {
        exit(path) {

          if (path.node.value?.type == 'JSXExpressionContainer') {

            path.replaceWith(
              t.jsxIdentifier(
                print(path.node).replace('={', '=${')
              )
            );

            path.skip();

            return;
          }
        }
      },
      JSXElement: {
        exit(path) {

          if (path.parent.type == 'JSXElement' || path.parent.type == 'JSXFragment') {

            path.replaceWith(
              t.identifier(print(path.node))
            );

            return;
          }
          else {

            path.replaceWith(
              t.identifier('html`' + print(path.node) + '`')
            );

            return;
          }
        }
      },
      JSXFragment: {
        exit(path) {
          path.replaceWith(
            t.identifier(
              [
                'html`',
                ...path.node.children.map((child) => print(child)),
                '`',
              ].join('')
            )
          )
        }
      },    
      JSXExpressionContainer: {
        exit(path) {

          if (path.parent.type == 'JSXElement' || path.parent.type == 'JSXFragment') {

            path.replaceWith(
              t.identifier('$' + print(path.node))
            )

            return;
          }
        }
      }
    })
  }

  return {
    name,
    next,
  }
}