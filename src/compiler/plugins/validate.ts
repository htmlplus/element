import { DECORATOR_ELEMENT } from '../../constants/index.js';
import { Context } from '../../types/index.js';
import { visitor } from '../utils/visitor.js';

export const validate = () => {
  const name = 'validate';

  // rules:
  // 1: Should export only one class
  // 2: that class should have @Element decorator
  // 2: if @Element has argument, that should have '-' character

  const next = (context: Context) => {
    let isValid = false;
    let message = 'No Class exported from file';

    visitor(context.fileAST as any, {
      ExportNamedDeclaration: {
        enter(path) {
          console.log(path.node.declaration.type);
          if (path.node.declaration.type !== 'ClassDeclaration') {
            // skip
            return;
          }
          if (isValid) {
            isValid = false;
            message = 'Error: You should only export one class';
            return;
          }

          const decorators = path.node.declaration.decorators ?? [];

          let hasElementDecorator = false;
          decorators.map((decorator) => {
            // TODO: handle: import {Element as SomethingElse} from '@htmlplus/element'
            console.log(decorator);
            if (
              decorator.expression.type === 'CallExpression' &&
              decorator.expression.callee.type === 'Identifier' &&
              decorator.expression.callee.name === DECORATOR_ELEMENT
            ) {
              hasElementDecorator = true;
              //  now check if has valid name
              const [argument] = decorator.expression.arguments;

              // QUESTION: what if no argument is passed? do I need to validate filename or className?
              if (!argument) {
                isValid = true;
                message = "it's Valid";
                return;
              }

              if (!argument.value.includes('-')) {
                message = `Error: @${DECORATOR_ELEMENT}'s first argument should include '-' character`;
              } else {
                isValid = true;
                message = "it's Valid";
              }
            }
          });

          if (!hasElementDecorator) {
            message = `Error: you should use @${DECORATOR_ELEMENT} decorator for class`;
          }
        }
      }
    });
    console.log({ isValid, message });
    console.log(' '); // TODO: last line of console.log is not visible in console.
  };

  return {
    name,
    next
  };
};
