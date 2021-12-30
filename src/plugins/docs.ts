import { capitalCase, paramCase } from 'change-case';
import fs from 'fs';
import glob from 'glob';
import path from 'path';
import { Context } from '../types/index.js';
import { getInitializer, getTags, getType, printType } from '../utils/index.js';

export interface DocsOptions {
    // TODO bundle?: boolean;
    dist: string;
    prefix: string;
}

export const docs = (options: DocsOptions) => {

    const name = 'docs';

    const start = (global) => {
        global.docs = {
            prefix: options.prefix,
            components: []
        }
    }

    const next = (context: Context, global) => {

        const tags = getTags(context.class);

        const development = tags.some((tag) => tag.key == 'development');

        const experimental = tags.some((tag) => tag.key == 'experimental');

        const externals = fs.existsSync(path.resolve(context.directoryPath || '', 'externals'));

        const examples = (() => {

            const items = [];

            const source = path.join(context.directoryPath || '', 'examples');

            if (!fs.existsSync(source)) return items;

            return fs
                .readdirSync(source)
                .filter((file) => file.endsWith('.md'))
                .map((file) => {

                    const item: any = {};

                    const regex = /```\w+\s\[\w+(:\w+)?\]\s[\S\s]*?```/g;

                    const filePath = path.join(source, file);

                    const content = fs.readFileSync(filePath, 'utf8');

                    item.key = path.basename(filePath).replace('.md', '');

                    item.title = capitalCase(item.key);

                    item.readme = content.replace(regex, '').trim();

                    item.codes = (content.match(regex) || [])
                        .map((section) => {

                            try {

                                const lines = section.split('\n');

                                const key = ((lines[0].match(/\[\w+(:\w+)?\]/) || []).shift() || '').replace('[', '').replace(']', '');

                                const type = ((lines[0].match(/```\w+/) || []).pop() || '').replace('```', '');

                                const value = lines.slice(1, -1).join('\n');

                                return {
                                    key,
                                    type,
                                    value
                                }
                            }
                            catch { }
                        });

                    return item;
                })
        })();

        const readme = (() => {

            try {

                const source = path.resolve(context.directoryPath || '', `${context.fileName}.md`);

                return fs.readFileSync(source, 'utf8');
            }
            catch { }
        })();

        const description = (() => {

            const content = readme || '';

            if (!content.startsWith('# ')) return '';

            const sections = content.split('\n');

            for (let i = 1; i < sections.length; i++) {

                const section = sections[i].trim();

                if (!section) continue;

                return section;
            }

            return '';
        })();

        const properties = (context.classProperties || [])
            .map((property) => {

                const tags = getTags(property);

                const name = property.key['name'];

                const attribute = paramCase(name);

                // TODO
                const initializer = getInitializer(property.value as any);

                // TODO
                const reflect = (() => {

                    if (!property.decorators) return false;

                    try {
                        for (const decorator of property.decorators) {
                            for (const argument of decorator.expression['arguments']) {
                                for (const property of argument.properties) {
                                    if (property.key.name != 'reflect') continue;
                                    if (property.value.type != 'BooleanLiteral') continue;
                                    if (!property.value.value) continue;
                                    return true;
                                }
                            }
                        }
                    }
                    catch { }

                    return false;
                })();

                const required = !property.optional;

                // TODO  
                const { type, members } = (() => {

                    const ast = getType(
                        context.fileAST as any,
                        (property.typeAnnotation || {})['typeAnnotation'],
                        {
                            directory: context.directoryPath,
                        }
                    )

                    return printType(ast);
                })();

                const experimental = tags.some((tag) => tag.key == 'experimental');

                const description = tags.find((tag) => !tag.key)?.value;

                const model = tags.some((tag) => tag.key == 'model');

                return {
                    name,
                    attribute,
                    initializer,
                    reflect,
                    required,
                    type,
                    experimental,
                    description,
                    members,
                    model,
                }
            });

        const parts = tags
            .filter((tag) => tag.key == 'part')
            .map((tag) => {

                const sections = tag.value?.split('-') || [];

                const name = sections[0].trim();

                const description = sections.slice(1).join('-').trim();

                return {
                    name,
                    description,
                }
            });

        const methods = (context.classMethods || [])
            .map((method) => {

                const tags = getTags(method);

                const name = method.key['name'];

                const experimental = tags.some((tag) => tag.key == 'experimental');

                // TODO
                // const params = printType(getType(
                //     context.ast,
                //     method.params,
                //     {
                //         directory: context.directory,
                //     }
                // ));

                // console.log(111, params)

                // TODO: returnType
                const type = (() => {
                    try {
                        return printType(getType(
                            context.fileAST as any,
                            (method.returnType || {})['typeAnnotation'],
                            {
                                directory: context.directoryPath,
                            }
                        ));
                    } catch { }
                })();

                // TODO
                const signature = `${method.key['name']}(${''}) => ${type}`;

                const description = tags.find((tag) => !tag.key)?.value;

                // TODO
                const parameters = [
                    // {
                    //     "name": "offsetX",
                    //     "description": "Moving size (px) in the `horizontal` direction. Use `null` to ignore this."
                    // },
                    // {
                    //     "name": "offsetY",
                    //     "description": "Moving size (px) in the `vertical` direction. Use `null` to ignore this."
                    // }
                ];

                return {
                    name,
                    experimental,
                    type,
                    signature,
                    description,
                    parameters,
                }
            });

        const slots = tags
            .filter((tag) => tag.key == 'slot')
            .map((tag) => {

                const sections = tag.value?.split('-') || [];

                const name = sections[0].trim();

                const description = sections.slice(1).join('-').trim();

                return {
                    name,
                    description,
                }
            });

        const events = (context.classEvents || [])
            .map((event) => {

                const tags = getTags(event);

                const name = event.key['name'];

                const cancelable = (() => {

                    if (!event.decorators) return false;

                    try {
                        for (const decorator of event.decorators) {
                            for (const argument of decorator.expression['arguments']) {
                                for (const property of argument.properties) {
                                    if (property.key.name != 'cancelable') continue;
                                    if (property.value.type != 'BooleanLiteral') continue;
                                    if (!property.value.value) continue;
                                    return true;
                                }
                            }
                        }
                    }
                    catch { }

                    return false;
                })();

                // TODO
                const detail = (() => {
                    try {
                        return printType(getType(
                            context.fileAST as any,
                            (event.typeAnnotation || {})['typeAnnotation'].typeParameters.params[0],
                            {
                                directory: context.directoryPath,
                            }
                        ))
                    } catch { }
                })()

                const experimental = tags.some((tag) => tag.key == 'experimental');

                const description = tags.find((tag) => !tag.key)?.value;

                const model = tags.some((tag) => tag.key == 'model');

                return {
                    name,
                    cancelable,
                    detail,
                    experimental,
                    description,
                    model,
                }
            });

        const styles = (() => {

            const styles: Array<any> = [];

            try {

                fs
                    .readFileSync(context.stylePath || '', 'utf8')
                    .split('@prop')
                    .slice(1)
                    .map((section) => {

                        let [description, name] = section.split(/\n/);

                        name = name.split(':').slice(0, -1).join(':').trim();

                        description = description.trim();

                        let [initializer] = context.styleParsed?.split(name).slice(1, 2) || [];

                        if (initializer) initializer = initializer.split(/;|}/)[0].replace(':', '').trim();

                        styles.push({
                            name,
                            initializer,
                            description
                        })
                    })
            }
            catch { }

            return styles;
        })();

        // TODO
        const lastModified = 0;
        // glob
        //     .sync(path.join(context.directory, '**/*.*'))
        //     .reduce((result, file) => {

        //         const state = fs.statSync(file);

        //         return result > state.mtime ? result : state.mtime
        //     }, 0);

        const group = tags.find((tag) => tag.key == 'group')?.value || null;

        const main = (group && context.componentKey == group) || !group;

        // TODO
        // context.types = (() => {
        //     return [];
        // })();

        global.docs.components.push({
            key: context.componentKey,
            tag: context.componentTag,
            title: capitalCase(context.componentKey || ''),
            main,
            group,
            development,
            experimental,

            // TODO
            deprecated: false,

            externals,
            lastModified,

            // TODO
            tags: [],

            // TODO
            source: context.componentKey,

            description,
            readme,
            properties,
            slots,
            events,
            styles,
            parts,
            methods,
            examples,
        });
    }

    const finish = (global) => {

        global.docs.components = global.docs.components.sort((a, b) => a.key > b.key ? 1 : -1);

        // TODO
        // fs.ensureDirSync(path.dirname(options.dist));

        // TODO
        // fs.writeJSONSync(options.dist, global.docs, { replacer: null, spaces: 2 });
    }

    return {
        name,
        start,
        next,
        finish,
    }
}