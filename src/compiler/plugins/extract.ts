import * as t from '@babel/types';
import { ClassMethod, ClassProperty } from '@babel/types';
import { capitalCase, paramCase } from 'change-case';
import fs from 'fs';
import path from 'path';

import * as CONSTANTS from '../../configs/constants.js';
import { Context } from '../../types/index.js';
import { hasDecorator, visitor } from '../utils/index.js';

export interface ExtractOptions {
  prefix?: string;
}

export const extract = (options?: ExtractOptions) => {
  const name = 'extract';

  const next = (context: Context) => {
    visitor(context.fileAST as any, {
      ClassDeclaration: {
        exit(path) {
          context.class = path.node;
          context.classMembers = context.class?.body?.body || [];
          path.skip();
        }
      },
      Decorator(path) {
        const name = path.node.expression.callee?.name;

        // TODO
        if (CONSTANTS.TOKEN_DECORATOR_ELEMENT == name) {
          const [argument] = path.node.expression.arguments;

          if (argument) {
            context.componentTag = argument?.value;
            return;
          }

          context.componentTag = paramCase(path.parent.id.name);

          if (options?.prefix) context.componentTag = options.prefix + '-' + context.componentTag;

          path.replaceWith(
            t.decorator(
              t.callExpression(t.identifier(name), [
                t.stringLiteral(context.componentTag),
                ...path.node.expression.arguments.slice(1)
              ])
            )
          );

          return;
        }
      }
    });

    context.directoryPath = path.dirname(context.filePath!);

    context.directoryName = path.basename(context.directoryPath!);

    context.fileExtension = path.extname(context.filePath!);

    context.fileName = path.basename(context.filePath!, context.fileExtension);

    context.className = context.class?.id?.name!;

    context.componentKey = paramCase(context.className);

    (() => {
      const stylePath = path.join(context.directoryPath, `${context.fileName}.scss`);

      if (!fs.existsSync(stylePath)) return;

      context.stylePath = stylePath;
    })();

    context.classAttributes = (context.classMembers || []).filter((member) =>
      hasDecorator(member, CONSTANTS.TOKEN_DECORATOR_ATTRIBUTES)
    );

    context.classEvents = (context.classMembers || []).filter((member) =>
      hasDecorator(member, CONSTANTS.TOKEN_DECORATOR_EVENT)
    ) as Array<ClassProperty>;

    context.classMethods = (context.classMembers || []).filter((member) =>
      hasDecorator(member, CONSTANTS.TOKEN_DECORATOR_METHOD)
    ) as Array<ClassMethod>;

    context.classProperties = (context.classMembers || []).filter((member) =>
      hasDecorator(member, CONSTANTS.TOKEN_DECORATOR_PROPERTY)
    ) as Array<ClassProperty>;

    context.classStates = (context.classMembers || []).filter((member) =>
      hasDecorator(member, CONSTANTS.TOKEN_DECORATOR_STATE)
    ) as Array<ClassProperty>;

    context.classHasMount = (context.classMembers || []).some(
      (member) => member['key'].name == CONSTANTS.TOKEN_LIFECYCLE_CONNECTED
    );

    context.classHasUnmount = (context.classMembers || []).some(
      (member) => member['key'].name == CONSTANTS.TOKEN_LIFECYCLE_DISCONNECTED
    );

    context.classRender = (context.classMembers || []).find(
      (member) => member['key'].name == CONSTANTS.TOKEN_METHOD_RENDER
    ) as ClassMethod;
  };

  return {
    name,
    next
  };
};
