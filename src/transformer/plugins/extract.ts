import t from '@babel/types';
import { kebabCase } from 'change-case';

import * as CONSTANTS from '@/constants';
import { hasDecorator } from '@/transformer/utils';

import type { TransformerPlugin, TransformerPluginContext } from '../transformer.types';

export const extract = (): TransformerPlugin => {
	const name = 'extract';

	const run = (context: TransformerPluginContext) => {
		const body = context.fileAST?.program.body.find((child) => {
			return t.isExportNamedDeclaration(child);
		});

		context.class = body?.declaration as t.ClassDeclaration | undefined;

		if (context.class) {
			context.class.leadingComments = body?.leadingComments; // TODO
		}

		context.classMembers = context.class?.body?.body || [];

		context.className = context.class?.id?.name;

		context.elementKey = kebabCase(context.className || '');

		context.classEvents = context.classMembers.filter((member) =>
			hasDecorator(member, CONSTANTS.DECORATOR_EVENT)
		) as t.ClassProperty[];

		context.classMethods = context.classMembers.filter((member) =>
			hasDecorator(member, CONSTANTS.DECORATOR_METHOD)
		) as t.ClassMethod[];

		context.classProperties = context.classMembers.filter((member) =>
			hasDecorator(member, CONSTANTS.DECORATOR_PROPERTY)
		) as t.ClassProperty[];

		context.classStates = context.classMembers.filter((member) =>
			hasDecorator(member, CONSTANTS.DECORATOR_STATE)
		) as t.ClassProperty[];
	};

	return { name, run };
};
