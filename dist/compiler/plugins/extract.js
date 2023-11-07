import t from '@babel/types';
import { kebabCase } from 'change-case';
import path from 'path';
import * as CONSTANTS from '../../constants/index.js';
import { hasDecorator, visitor } from '../utils/index.js';
export const extract = () => {
    const name = 'extract';
    const run = (context) => {
        var _a, _b;
        visitor(context.fileAST, {
            ClassDeclaration: {
                exit(path) {
                    var _a, _b, _c;
                    context.class = path.node;
                    context.classMembers = ((_b = (_a = context.class) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.body) || [];
                    // TODO
                    if (path.parentPath.isExportNamedDeclaration() && !((_c = context.class) === null || _c === void 0 ? void 0 : _c.leadingComments)) {
                        context.class['_leadingComments'] = t.cloneNode(path.parentPath.node, true).leadingComments || [];
                    }
                    path.skip();
                }
            },
            JSXElement(path) {
                var _a;
                const { openingElement } = path.node;
                const name = openingElement.name.name;
                if (!/-/g.test(name))
                    return;
                (_a = context.customElementNames) !== null && _a !== void 0 ? _a : (context.customElementNames = []);
                context.customElementNames.push(name);
                context.customElementNames = context.customElementNames
                    .filter((item, index, items) => items.indexOf(item) === index)
                    .sort();
            }
        });
        context.directoryPath = path.dirname(context.filePath);
        context.directoryName = path.basename(context.directoryPath);
        context.fileExtension = path.extname(context.filePath);
        context.fileName = path.basename(context.filePath, context.fileExtension);
        context.className = (_b = (_a = context.class) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.name;
        context.componentKey = kebabCase(context.className);
        context.classEvents = (context.classMembers || []).filter((member) => hasDecorator(member, CONSTANTS.DECORATOR_EVENT));
        context.classMethods = (context.classMembers || []).filter((member) => hasDecorator(member, CONSTANTS.DECORATOR_METHOD));
        context.classProperties = (context.classMembers || []).filter((member) => hasDecorator(member, CONSTANTS.DECORATOR_PROPERTY));
        context.classStates = (context.classMembers || []).filter((member) => hasDecorator(member, CONSTANTS.DECORATOR_STATE));
        context.classHasMount = (context.classMembers || []).some((member) => member['key'].name == CONSTANTS.LIFECYCLE_CONNECTED);
        context.classHasUnmount = (context.classMembers || []).some((member) => member['key'].name == CONSTANTS.LIFECYCLE_DISCONNECTED);
        context.classRender = (context.classMembers || []).find((member) => member['key'].name == CONSTANTS.METHOD_RENDER);
    };
    return { name, run };
};
