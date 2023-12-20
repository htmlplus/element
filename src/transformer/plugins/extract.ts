import t from '@babel/types';
import { ClassMethod, ClassProperty } from '@babel/types';
import { kebabCase } from 'change-case';

import * as CONSTANTS from '../../constants/index.js';
import { TransformerPlugin, TransformerPluginContext } from '../transformer.types';
import { hasDecorator, visitor } from '../utils/index.js';

export const extract = (): TransformerPlugin => {
  const name = 'extract';

  const run = (context: TransformerPluginContext) => {
    visitor(context.fileAST as any, {
      ClassDeclaration: {
        exit(path) {
          context.class = path.node;

          context.classMembers = context.class?.body?.body || [];

          // TODO
          if (path.parentPath.isExportNamedDeclaration() && !context.class?.leadingComments) {
            context.class!['_leadingComments'] = t.cloneNode(path.parentPath.node, true).leadingComments || [];
          }

          path.skip();
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

    context.className = context.class?.id?.name!;

    context.elementKey = kebabCase(context.className);

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

  return { name, run };
};
