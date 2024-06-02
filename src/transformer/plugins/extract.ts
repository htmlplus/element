import t from '@babel/types';
import { kebabCase } from 'change-case';

import * as CONSTANTS from '../../constants/index.js';
import { TransformerPlugin, TransformerPluginContext } from '../transformer.types.js';
import { hasDecorator } from '../utils/index.js';

export const extract = (): TransformerPlugin => {
  const name = 'extract';

  const run = (context: TransformerPluginContext) => {
    const { declaration, leadingComments } = context.fileAST?.program.body.find((child) => {
      return t.isExportNamedDeclaration(child);
    }) as any;

    context.class = declaration;

    context.class!.leadingComments = leadingComments; // TODO

    context.classMembers = context.class?.body?.body || [];

    context.className = context.class?.id?.name;

    context.elementKey = kebabCase(context.className || '');

    context.classEvents = context.classMembers.filter((member) =>
      hasDecorator(member, CONSTANTS.DECORATOR_EVENT)
    ) as any;

    context.classMethods = context.classMembers.filter((member) =>
      hasDecorator(member, CONSTANTS.DECORATOR_METHOD)
    ) as any;

    context.classProperties = context.classMembers.filter((member) =>
      hasDecorator(member, CONSTANTS.DECORATOR_PROPERTY)
    ) as any;

    context.classStates = context.classMembers.filter((member) =>
      hasDecorator(member, CONSTANTS.DECORATOR_STATE)
    ) as any;
  };

  return { name, run };
};
