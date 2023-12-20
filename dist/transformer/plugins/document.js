import { capitalCase, kebabCase } from 'change-case';
import fs from 'fs-extra';
import glob from 'glob';
import path from 'path';
import { getInitializer, getTag, getTags, getTypeReference, hasTag, parseTag, print } from '../utils/index.js';
export const DOCUMENT_OPTIONS = {
    destination: path.join('dist', 'document.json')
};
export const document = (options) => {
    const name = 'document';
    options = Object.assign({}, DOCUMENT_OPTIONS, options);
    const finish = (global) => {
        var _a, _b, _c, _d;
        const json = {
            elements: []
        };
        for (const context of global.contexts) {
            const deprecated = hasTag(context.class, 'deprecated');
            const description = (_a = getTags(context.class).find((tag) => !tag.key)) === null || _a === void 0 ? void 0 : _a.value;
            const events = context.classEvents.map((event) => {
                var _a, _b, _c;
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
                    catch (_a) { }
                    return false;
                })();
                const deprecated = hasTag(event, 'deprecated');
                const description = (_a = getTags(event).find((tag) => !tag.key)) === null || _a === void 0 ? void 0 : _a.value;
                const detail = print((_b = event.typeAnnotation) === null || _b === void 0 ? void 0 : _b['typeAnnotation']);
                const detailReference = getTypeReference(context.fileAST, (_c = event.typeAnnotation) === null || _c === void 0 ? void 0 : _c['typeAnnotation'].typeParameters.params[0]);
                const experimental = hasTag(event, 'experimental');
                const model = hasTag(event, 'model');
                const name = event.key['name'];
                const tags = getTags(event);
                return {
                    cancelable,
                    deprecated,
                    description,
                    detail,
                    detailReference,
                    experimental,
                    model,
                    name,
                    tags
                };
            });
            const experimental = hasTag(context.class, 'experimental');
            const group = (_b = getTag(context.class, 'group')) === null || _b === void 0 ? void 0 : _b.value;
            const lastModified = glob
                .sync('**/*.*', { cwd: context.directoryPath })
                .map((file) => fs.statSync(path.join(context.directoryPath, file)).mtime)
                .sort((a, b) => (a > b ? 1 : -1))
                .pop();
            const methods = context.classMethods.map((method) => {
                var _a, _b, _c;
                const async = method.async;
                const description = (_a = getTags(method).find((tag) => !tag.key)) === null || _a === void 0 ? void 0 : _a.value;
                const deprecated = hasTag(method, 'deprecated');
                const experimental = hasTag(method, 'experimental');
                const name = method.key['name'];
                // TODO
                const parameters = method.params.map((param) => {
                    var _a, _b, _c;
                    return ({
                        description: (_a = getTags(method, 'param')
                            .map((tag) => parseTag(tag, ' '))
                            .find((tag) => tag.name == param['name'])) === null || _a === void 0 ? void 0 : _a.description,
                        required: !param['optional'],
                        name: param['name'],
                        type: print((_b = param === null || param === void 0 ? void 0 : param['typeAnnotation']) === null || _b === void 0 ? void 0 : _b.typeAnnotation) || undefined,
                        typeReference: getTypeReference(context.fileAST, (_c = param === null || param === void 0 ? void 0 : param['typeAnnotation']) === null || _c === void 0 ? void 0 : _c.typeAnnotation)
                    });
                });
                const returns = print((_b = method.returnType) === null || _b === void 0 ? void 0 : _b['typeAnnotation']) || 'void';
                const returnsReference = getTypeReference(context.fileAST, (_c = method.returnType) === null || _c === void 0 ? void 0 : _c['typeAnnotation']);
                const tags = getTags(method);
                const signature = [
                    method.key['name'],
                    '(',
                    parameters
                        .map((parameter) => {
                        var _a;
                        let string = '';
                        string += parameter.name;
                        string += parameter.required ? '' : '?';
                        string += parameter.type ? ': ' : '';
                        string += (_a = parameter.type) !== null && _a !== void 0 ? _a : '';
                        return string;
                    })
                        .join(', '),
                    ')',
                    ' => ',
                    returns
                ].join('');
                return {
                    async,
                    description,
                    deprecated,
                    experimental,
                    name,
                    parameters,
                    returns,
                    returnsReference,
                    tags,
                    signature
                };
            });
            const parts = getTags(context.class, 'part').map((tag) => parseTag(tag));
            const properties = context.classProperties.map((property) => {
                var _a, _b, _c;
                const attribute = kebabCase(property.key['name']);
                const deprecated = hasTag(property, 'deprecated');
                const description = (_a = getTags(property).find((tag) => !tag.key)) === null || _a === void 0 ? void 0 : _a.value;
                const experimental = hasTag(property, 'experimental');
                // TODO
                const initializer = getInitializer(property.value);
                const model = hasTag(property, 'model');
                const name = property.key['name'];
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
                    catch (_a) { }
                    return false;
                })();
                const required = !property.optional;
                const tags = getTags(property);
                const type = print((_b = property.typeAnnotation) === null || _b === void 0 ? void 0 : _b['typeAnnotation']);
                const typeReference = getTypeReference(context.fileAST, (_c = property.typeAnnotation) === null || _c === void 0 ? void 0 : _c['typeAnnotation']);
                return {
                    attribute,
                    deprecated,
                    description,
                    experimental,
                    initializer,
                    model,
                    name,
                    reflects,
                    required,
                    tags,
                    type,
                    typeReference
                };
            });
            const slots = getTags(context.class, 'slot').map((tag) => parseTag(tag));
            // TODO
            const styles = (() => {
                if (!context.stylePath)
                    return [];
                return fs
                    .readFileSync(context.stylePath, 'utf8')
                    .split('@Property()')
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
            const tags = getTags(context.class).filter((tag) => !['part', 'slot'].includes(tag.key));
            const title = capitalCase(context.elementKey);
            const element = {
                events,
                group,
                deprecated,
                description,
                experimental,
                key: context.elementKey,
                lastModified,
                methods,
                parts,
                properties,
                readmeContent: context.readmeContent,
                slots,
                styles,
                tags,
                title
            };
            const transformed = ((_d = (_c = options).transformer) === null || _d === void 0 ? void 0 : _d.call(_c, context, element)) || element;
            json.elements.push(transformed);
        }
        json.elements = json.elements.sort((a, b) => (a.title > b.title ? 1 : -1));
        const dirname = path.dirname(options.destination);
        fs.ensureDirSync(dirname);
        fs.writeJSONSync(options.destination, json, { encoding: 'utf8', spaces: 2 });
    };
    return { name, finish };
};
