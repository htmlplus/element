import * as t from '@babel/types';
import { ClassMethod, ClassProperty } from '@babel/types';
import { pascalCase, paramCase } from 'change-case';
import path from 'path';

import * as CONSTANTS from '../../constants/index.js';
import { Context } from '../../types';
import { hasDecorator, visitor } from '../utils/index.js';

export const EXTRACT_OPTIONS: Partial<ExtractOptions> = {};

export interface ExtractOptions {
  prefix?: string;
}

export const extract = (options?: ExtractOptions) => {
  const name = 'extract';

  options = Object.assign({}, EXTRACT_OPTIONS, options);

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
        if (CONSTANTS.DECORATOR_ELEMENT == name) {
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
      },
      JSXElement(path) {
        const { openingElement } = path.node;

        const name = openingElement.name.name;

        if (!/-/g.test(name)) return;

        context.customElementNames ??= [];

        context.customElementNames.push(name);

        context.customElementNames = context.customElementNames
          .filter((item, index, items) => items.indexOf(item) === index)
          .sort();
      }
    });

    context.directoryPath = path.dirname(context.filePath!);

    context.directoryName = path.basename(context.directoryPath!);

    context.fileExtension = path.extname(context.filePath!);

    context.fileName = path.basename(context.filePath!, context.fileExtension);

    context.className = context.class?.id?.name!;

    context.componentKey = paramCase(context.className);

    // TODO
    context.componentInterfaceName = `HTML${pascalCase(context.componentTag!)}Element`;

    context.classEvents = (context.classMembers || []).filter((member) =>
      hasDecorator(member, CONSTANTS.DECORATOR_EVENT)
    ) as Array<ClassProperty>;

    context.classMethods = (context.classMembers || []).filter((member) =>
      hasDecorator(member, CONSTANTS.DECORATOR_METHOD)
    ) as Array<ClassMethod>;

    context.classProperties = (context.classMembers || []).filter((member) =>
      hasDecorator(member, CONSTANTS.DECORATOR_PROPERTY)
    ) as Array<ClassProperty>;

    context.classStates = (context.classMembers || []).filter((member) =>
      hasDecorator(member, CONSTANTS.DECORATOR_STATE)
    ) as Array<ClassProperty>;

    context.classHasMount = (context.classMembers || []).some(
      (member) => member['key'].name == CONSTANTS.LIFECYCLE_CONNECTED
    );

    context.classHasUnmount = (context.classMembers || []).some(
      (member) => member['key'].name == CONSTANTS.LIFECYCLE_DISCONNECTED
    );

    context.classRender = (context.classMembers || []).find(
      (member) => member['key'].name == CONSTANTS.METHOD_RENDER
    ) as ClassMethod;
  };

  return { name, next };
};
