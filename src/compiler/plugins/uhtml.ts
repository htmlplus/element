import t from '@babel/types';
import { Context } from '../../types/index.js';
import { print, visitor } from '../utils/index.js';

export const uhtml = () => {

  const name = 'uhtml';

  const next = (context: Context) => {

    context.fileAST?.program.body.unshift(
      t.importDeclaration(
        [
          t.importSpecifier(
            t.identifier('html'),
            t.identifier('html'),
          )
        ],
        t.stringLiteral('@htmlplus/element/runtime')
      )
    )

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
            }

            path.replaceWith(
              t.jsxIdentifier(
                print(node).replace('={', '=${')
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