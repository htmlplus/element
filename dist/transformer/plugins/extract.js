import t from '@babel/types';
import { kebabCase } from 'change-case';
import * as CONSTANTS from '../../constants/index.js';
import { hasDecorator } from '../utils/index.js';
export const extract = () => {
    const name = 'extract';
    const run = (context) => {
        const { declaration, leadingComments } = context.fileAST?.program.body.find((child) => {
            return t.isExportNamedDeclaration(child);
        });
        context.class = declaration;
        context.class.leadingComments = leadingComments; // TODO
        context.classMembers = context.class?.body?.body || [];
        context.className = context.class?.id?.name;
        context.elementKey = kebabCase(context.className || '');
        context.classEvents = context.classMembers.filter((member) => hasDecorator(member, CONSTANTS.DECORATOR_EVENT));
        context.classMethods = context.classMembers.filter((member) => hasDecorator(member, CONSTANTS.DECORATOR_METHOD));
        context.classProperties = context.classMembers.filter((member) => hasDecorator(member, CONSTANTS.DECORATOR_PROPERTY));
        context.classStates = context.classMembers.filter((member) => hasDecorator(member, CONSTANTS.DECORATOR_STATE));
    };
    return { name, run };
};
