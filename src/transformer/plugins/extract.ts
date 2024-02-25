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
            context.class!['_leadingComments'] =
              t.cloneNode(path.parentPath.node, true).leadingComments || [];
          }

          path.skip();
        }
      }
    });

    context.className = context.class?.id?.name;

    context.elementKey = kebabCase(context.className || '');

    context.classEvents = (context.classMembers || []).filter((member) =>
      hasDecorator(member, CONSTANTS.DECORATOR_EVENT)
    ) as any;

    context.classMethods = (context.classMembers || []).filter((member) =>
      hasDecorator(member, CONSTANTS.DECORATOR_METHOD)
    ) as any;

    context.classProperties = (context.classMembers || []).filter((member) =>
      hasDecorator(member, CONSTANTS.DECORATOR_PROPERTY)
    ) as any;

    context.classStates = (context.classMembers || []).filter((member) =>
      hasDecorator(member, CONSTANTS.DECORATOR_STATE)
    ) as any;

    context.classHasMount = (context.classMembers || []).some(
      (member) => member['key'].name == CONSTANTS.LIFECYCLE_CONNECTED
    ) as any;

    context.classHasUnmount = (context.classMembers || []).some(
      (member) => member['key'].name == CONSTANTS.LIFECYCLE_DISCONNECTED
    ) as any;

    context.classRender = (context.classMembers || []).find(
      (member) => member['key'].name == CONSTANTS.METHOD_RENDER
    ) as any;
  };

  return { name, run };
};
