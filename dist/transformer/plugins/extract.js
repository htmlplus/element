import t from '@babel/types';
import { kebabCase } from 'change-case';
import * as CONSTANTS from '../../constants/index.js';
import { hasDecorator } from '../utils/index.js';
export const extract = () => {
    const name = 'extract';
    const run = (context) => {
        var _a, _b, _c, _d, _e;
        const { declaration, leadingComments } = (_a = context.fileAST) === null || _a === void 0 ? void 0 : _a.program.body.find((child) => {
            return t.isExportNamedDeclaration(child);
        });
        context.class = declaration;
        context.class.leadingComments = leadingComments; // TODO
        context.classMembers = ((_c = (_b = context.class) === null || _b === void 0 ? void 0 : _b.body) === null || _c === void 0 ? void 0 : _c.body) || [];
        context.className = (_e = (_d = context.class) === null || _d === void 0 ? void 0 : _d.id) === null || _e === void 0 ? void 0 : _e.name;
        context.elementKey = kebabCase(context.className || '');
        context.classEvents = context.classMembers.filter((member) => hasDecorator(member, CONSTANTS.DECORATOR_EVENT));
        context.classMethods = context.classMembers.filter((member) => hasDecorator(member, CONSTANTS.DECORATOR_METHOD));
        context.classProperties = context.classMembers.filter((member) => hasDecorator(member, CONSTANTS.DECORATOR_PROPERTY));
        context.classStates = context.classMembers.filter((member) => hasDecorator(member, CONSTANTS.DECORATOR_STATE));
    };
    return { name, run };
};
