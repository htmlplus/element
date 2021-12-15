import { ClassMethod, ClassProperty } from '@babel/types';
import { capitalCase, paramCase } from 'change-case';
import * as fs from 'fs';
import * as path from 'path';
import * as CONSTANTS from '../configs/constants.js';
import { Context } from '../types/index.js';
import { hasDecorator, visitor } from '../utils/index.js';

export interface ExtractOptions {
    prefix?: string;
}

export const extract = (options: ExtractOptions) => {

    const name = 'extract';

    const next = (context: Context) => {

        const additions: Array<any> = [];

        visitor(context.ast as any, {
            ClassDeclaration: {
                exit(path) {

                    context.component = path.node;

                    context.members = context.component?.body?.body || [];

                    path.skip();
                }
            },
            Decorator(path) {

                const { name } = path.node.expression.callee;

                if (
                    ![
                        CONSTANTS.TOKEN_DECORATOR_COMPONENT,
                        CONSTANTS.TOKEN_DECORATOR_METHOD,
                    ].includes(name)
                ) return;

                additions.push(path);
            }
        });

        context.directory = path.dirname(context.filename);

        context.name = context.component?.id?.name || '';

        context.prefix = options.prefix || '';

        context.key = paramCase(context.name);

        context.tag = `${options.prefix}-${context.key}`;

        context.title = capitalCase(context.key);

        (() => {

            const stylePath = path.join(context.directory, `${context.key}.scss`);

            if (!fs.existsSync(stylePath)) return;

            context.stylePath = stylePath;
        })();

        context.attributes = context
            .members
            .filter((member) => hasDecorator(member, CONSTANTS.TOKEN_DECORATOR_ATTRIBUTES));

        context.events = context
            .members
            .filter((member) => hasDecorator(member, CONSTANTS.TOKEN_DECORATOR_EVENT)) as Array<ClassProperty>;

        context.methods = context
            .members
            .filter((member) => hasDecorator(member, CONSTANTS.TOKEN_DECORATOR_METHOD)) as Array<ClassMethod>;

        context.properties = context
            .members
            .filter((member) => hasDecorator(member, CONSTANTS.TOKEN_DECORATOR_PROPERTY)) as Array<ClassProperty>;

        context.states = context
            .members
            .filter((member) => hasDecorator(member, CONSTANTS.TOKEN_DECORATOR_STATE)) as Array<ClassProperty>;

        context.hasMount = context
            .members
            .some((member) => member['key'].name == CONSTANTS.TOKEN_LIFECYCLE_MOUNT);

        context.hasUnmount = context
            .members
            .some((member) => member['key'].name == CONSTANTS.TOKEN_LIFECYCLE_UNMOUNT);

        context.render = context
            .members
            .find((member) => member['key'].name == CONSTANTS.TOKEN_METHOD_RENDER) as ClassMethod;

        additions.forEach((path) => path.remove());
    }

    return {
        name,
        next,
    }
}