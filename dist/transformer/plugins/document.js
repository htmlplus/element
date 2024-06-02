import { capitalCase, kebabCase } from 'change-case';
import fs from 'fs-extra';
import { glob } from 'glob';
import path from 'path';
import * as CONSTANTS from '../../constants/index.js';
import { extractAttribute, extractFromComment, getInitializer, getTypeReference, print } from '../utils/index.js';
export const DOCUMENT_OPTIONS = {
    destination: path.join('dist', 'document.json')
};
export const document = (options) => {
    const name = 'document';
    options = Object.assign({}, DOCUMENT_OPTIONS, options);
    const finish = (global) => {
        const json = {
            elements: []
        };
        for (const context of global.contexts) {
            const events = context.classEvents.map((event) => {
                const cancelable = (() => {
                    if (!event.decorators)
                        return false;
                    try {
                        for (const decorator of event.decorators) {
                            for (const argument of decorator.expression['arguments']) {
                                for (const property of argument.properties) {
                                    if (property.key.name != 'cancelable')
                                        continue;
                                    if (property.value.type != 'BooleanLiteral')
                                        continue;
                                    if (!property.value.value)
                                        continue;
                                    return true;
                                }
                            }
                        }
                    }
                    catch { }
                    return false;
                })();
                const detail = print(event.typeAnnotation?.['typeAnnotation']);
                const detailReference = getTypeReference(context.fileAST, event.typeAnnotation?.['typeAnnotation'].typeParameters.params[0]);
                const name = event.key['name'];
                return Object.assign({
                    cancelable,
                    detail,
                    detailReference,
                    name
                }, extractFromComment(event));
            });
            const lastModified = glob
                .sync('**/*.*', { cwd: context.directoryPath })
                .map((file) => fs.statSync(path.join(context.directoryPath, file)).mtime)
                .sort((a, b) => (a > b ? 1 : -1))
                .pop();
            const methods = context.classMethods.map((method) => {
                const async = method.async;
                const name = method.key['name'];
                const comments = extractFromComment(method);
                // TODO
                const parameters = method.params.map((param) => ({
                    description: comments.params?.find((item) => item.name == param['name'])?.description,
                    required: !param['optional'],
                    name: param['name'],
                    type: print(param?.['typeAnnotation']?.typeAnnotation) || undefined,
                    typeReference: getTypeReference(context.fileAST, param?.['typeAnnotation']?.typeAnnotation)
                }));
                // TODO
                delete comments.params;
                const returns = print(method.returnType?.['typeAnnotation']) || 'void';
                const returnsReference = getTypeReference(context.fileAST, method.returnType?.['typeAnnotation']);
                const signature = [
                    method.key['name'],
                    '(',
                    parameters
                        .map((parameter) => {
                        let string = '';
                        string += parameter.name;
                        string += parameter.required ? '' : '?';
                        string += parameter.type ? ': ' : '';
                        string += parameter.type ?? '';
                        return string;
                    })
                        .join(', '),
                    ')',
                    ' => ',
                    returns
                ].join('');
                return Object.assign({
                    async,
                    name,
                    parameters,
                    returns,
                    returnsReference,
                    signature
                }, comments, 
                // TODO
                {
                    returns
                }, 
                // TODO
                returns != 'void' &&
                    comments.returns && {
                    tags: [
                        {
                            key: 'returns',
                            value: `${comments.returns}`
                        }
                    ]
                });
            });
            const properties = context.classProperties.map((property) => {
                const attribute = extractAttribute(property) || kebabCase(property.key['name']);
                // TODO
                const initializer = getInitializer(property.value);
                const name = property.key['name'];
                const readonly = property['kind'] == 'get';
                // TODO
                const reflects = (() => {
                    if (!property.decorators)
                        return false;
                    try {
                        for (const decorator of property.decorators) {
                            for (const argument of decorator.expression['arguments']) {
                                for (const property of argument.properties) {
                                    if (property.key.name != 'reflect')
                                        continue;
                                    if (property.value.type != 'BooleanLiteral')
                                        continue;
                                    if (!property.value.value)
                                        continue;
                                    return true;
                                }
                            }
                        }
                    }
                    catch { }
                    return false;
                })();
                const required = 'optional' in property && !property.optional;
                // TODO
                const type = property['returnType']
                    ? print(property['returnType']?.['typeAnnotation'])
                    : print(property.typeAnnotation?.['typeAnnotation']);
                const typeReference = getTypeReference(context.fileAST, property.typeAnnotation?.['typeAnnotation']);
                return Object.assign({
                    attribute,
                    initializer,
                    name,
                    readonly,
                    reflects,
                    required,
                    type,
                    typeReference
                }, extractFromComment(property));
            });
            // TODO
            const styles = (() => {
                if (!context.styleContent)
                    return [];
                return context.styleContent
                    .split(CONSTANTS.DECORATOR_CSS_VARIABLE)
                    .slice(1)
                    .map((section) => {
                    const [first, second] = section.split(/\n/);
                    const description = first.replace('*/', '').trim();
                    const name = second.split(':')[0].trim();
                    const initializer = second.split(':').slice(1).join(':').replace(';', '').trim();
                    return {
                        description,
                        initializer,
                        name
                    };
                });
            })();
            const title = capitalCase(context.elementKey);
            const element = Object.assign({
                events,
                key: context.elementKey,
                lastModified,
                methods,
                properties,
                readmeContent: context.readmeContent,
                styles,
                title
            }, extractFromComment(context.class));
            const transformed = options.transformer?.(context, element) || element;
            json.elements.push(transformed);
        }
        json.elements = json.elements.sort((a, b) => (a.title > b.title ? 1 : -1));
        const dirname = path.dirname(options.destination);
        fs.ensureDirSync(dirname);
        fs.writeJSONSync(options.destination, json, { encoding: 'utf8', spaces: 2 });
    };
    return { name, finish };
};
