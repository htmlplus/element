import generator from '@babel/generator';
import t from '@babel/types';
import traverse from '@babel/traverse';
import { parse as parse$1 } from '@babel/parser';
import fs from 'fs-extra';
import { glob } from 'glob';
import template from '@babel/template';
import { pascalCase, kebabCase, camelCase, capitalCase } from 'change-case';
import ora from 'ora';
import path, { join, resolve, dirname } from 'node:path';
import { KEY, COMMENT_AUTO_ADDED, DECORATOR_PROPERTY, STATIC_TAG, UTILS_STYLES_LOCAL, UTILS_PATH, DECORATOR_PROPERTY_TYPE, UTILS_STYLES_IMPORTED, ELEMENT_HOST_NAME, UTILS_HTML_IMPORTED, UTILS_HTML_LOCAL, TYPE_OBJECT, TYPE_ARRAY, TYPE_NULL, TYPE_STRING, TYPE_ENUM, TYPE_NUMBER, TYPE_DATE, TYPE_BOOLEAN, UTILS_ATTRIBUTES_IMPORTED, UTILS_ATTRIBUTES_LOCAL, DECORATOR_CSS_VARIABLE, DECORATOR_EVENT, DECORATOR_METHOD, DECORATOR_STATE, STATIC_STYLE, STYLE_IMPORTED, PACKAGE_NAME, DECORATOR_ELEMENT } from './constants.js';

const logger = ora({
    color: 'yellow'
});
const log = (message, persist) => {
    const content = `${new Date().toLocaleTimeString()} [${KEY}] ${message}`;
    const log = logger.start(content);
    if (!persist)
        return;
    log.succeed();
};
const transformer = (...plugins) => {
    let global = {
        contexts: []
    };
    const start = async () => {
        log(`Started.`, true);
        log(`${plugins.length} plugins detected.`, true);
        log(`Plugins are starting.`, true);
        for (const plugin of plugins) {
            if (!plugin.start)
                continue;
            log(`Plugin '${plugin.name}' is starting.`);
            global = (await plugin.start(global)) || global;
            log(`Plugin '${plugin.name}' started successfully.`);
        }
        log(`Plugins have been successfully started.`, true);
    };
    const run = async (filePath) => {
        path.join(filePath).split(path.sep).pop();
        let context = {
            filePath
        };
        const parsed = path.parse(filePath);
        for (const plugin of plugins) {
            if (!plugin.run)
                continue;
            const source = path.join(parsed.dir).split(path.sep).slice(-2).concat(parsed.base).join('/');
            log(`Plugin '${plugin.name}' is executing on '${source}' file.`);
            try {
                context = (await plugin.run(context, global)) || context;
            }
            catch (error) {
                log(`Error in '${plugin.name}' plugin on '${source}' file.\n`, true);
                throw error;
            }
            global.contexts = global.contexts
                .filter((current) => {
                return current.filePath != context.filePath;
            })
                .concat(context);
            log(`Plugin '${plugin.name}' executed successfully on '${source}' file.`);
        }
        logger.stop();
        return context;
    };
    const finish = async () => {
        log(`Plugins are finishing.`, true);
        for (const plugin of plugins) {
            if (!plugin.finish)
                continue;
            log(`Plugin '${plugin.name}' is finishing.`);
            global = (await plugin.finish(global)) || global;
            log(`Plugin '${plugin.name}' finished successfully.`);
        }
        log(`Plugins have been successfully finished.`, true);
        log(`Finished.`, true);
    };
    return { global, start, run, finish };
};

const ASSETS_OPTIONS = {
    destination(context) {
        return path.join('dist', 'assets', context.fileName);
    },
    source(context) {
        return path.join(context.directoryPath, 'assets');
    }
};
const assets = (options) => {
    const name = 'assets';
    options = Object.assign({}, ASSETS_OPTIONS, options);
    const finish = (global) => {
        for (const context of global.contexts) {
            context.assetsDestination = options.destination(context);
            context.assetsSource = options.source(context);
            if (!context.assetsSource)
                continue;
            if (!fs.existsSync(context.assetsSource))
                continue;
            fs.copySync(context.assetsSource, context.assetsDestination);
        }
    };
    return { name, finish };
};

const COPY_OPTIONS = {
    at: 'start'
};
const copy = (options) => {
    const name = 'copy';
    options = Object.assign({}, COPY_OPTIONS, options);
    const copy = (caller) => {
        if (options.at != caller)
            return;
        let content;
        content = fs.readFileSync(options.source, 'utf8');
        if (options.transformer)
            content = options.transformer(content);
        fs.ensureDirSync(path.dirname(options.destination));
        fs.writeFileSync(options.destination, content, 'utf8');
    };
    const start = () => {
        copy('start');
    };
    const run = () => {
        copy('run');
    };
    const finish = () => {
        copy('finish');
    };
    return { name, start, run, finish };
};

// TODO: options type
const visitor = (ast, options) => {
    (traverse.default || traverse)(ast, options);
};

function addDependency(path, source, local, imported, comment) {
    const isDefault = local && !imported;
    const isImport = local && imported;
    const isNormal = !local && !imported;
    let declaration;
    let file = path;
    while (file.parentPath)
        file = file.parentPath;
    file = file.node || file;
    visitor(file, {
        ImportDeclaration(path) {
            if (path.node.source.value != source)
                return;
            declaration = path.node;
        }
    });
    if (isNormal && declaration)
        return {
            node: declaration
        };
    let specifier = declaration?.specifiers.find((specifier) => {
        if (isDefault) {
            return specifier.type == 'ImportDefaultSpecifier';
        }
        else if (isImport) {
            return specifier.imported?.name == imported;
        }
    });
    if (specifier)
        return {
            local: specifier.local.name,
            node: declaration
        };
    if (isDefault) {
        specifier = t.importDefaultSpecifier(t.identifier(local));
    }
    else if (isImport) {
        specifier = t.importSpecifier(t.identifier(local), t.identifier(imported));
    }
    if (declaration) {
        if (isDefault) {
            declaration.specifiers.unshift(specifier);
        }
        else if (isImport) {
            declaration.specifiers.push(specifier);
        }
    }
    else {
        declaration = t.importDeclaration(specifier ? [specifier] : [], t.stringLiteral(source));
        // TODO
        (file.program || file).body.unshift(declaration);
        // TODO
        if (comment) {
            t.addComment(declaration, 'leading', COMMENT_AUTO_ADDED, true);
        }
    }
    return {
        local,
        node: declaration
    };
}

const extractAttribute = (property) => {
    try {
        return property.decorators
            .find((decorator) => decorator.expression.callee.name == DECORATOR_PROPERTY)
            .expression.arguments[0].properties.find((property) => property.key.name == 'attribute').value
            .value;
    }
    catch { }
};

const extractFromComment = (node, whitelist) => {
    const normalized = [];
    const result = {
        description: ''
    };
    const lines = node.leadingComments
        ?.map((comment) => {
        if (comment.type == 'CommentLine')
            return comment.value;
        return comment.value.split('\n');
    })
        ?.flat()
        ?.map((line) => line.trim().replace(/^\*/, '').trim())
        ?.filter((line) => line.trim());
    for (const line of lines || []) {
        if (line.startsWith('@')) {
            normalized.push(line);
            continue;
        }
        if (!normalized.length)
            normalized.push('');
        normalized[normalized.length - 1] += ' ' + line;
    }
    for (const line of normalized) {
        if (!line.startsWith('@')) {
            result.description = line.trim();
            continue;
        }
        const regex = /@(\w+)(?:\s*({\w+})\s*)?(?:\s*([-a-zA-Z\s]+)\s*-\s*)?(.*)/;
        const groups = regex.exec(line);
        if (!groups)
            continue;
        const tag = groups[1]?.trim();
        const type = groups[2]?.trim().slice(1, -1);
        const name = groups[3]?.trim();
        const description = groups[4]?.trim();
        if (name && description) {
            const key = tag + 's';
            if (whitelist && !whitelist.includes(key))
                continue;
            (result[key] ||= []).push({ name, type, description });
        }
        else {
            const key = tag;
            if (whitelist && !whitelist.includes(key))
                continue;
            result[key] = description || true;
        }
    }
    return result;
};

const getInitializer = (node) => {
    return node?.extra?.raw || node?.['value'];
};

const getType = (directory, file, node) => {
    if (!node)
        return node;
    if (node.type != 'TSTypeReference')
        return node;
    let result;
    visitor(file, {
        ClassDeclaration(path) {
            if (path.node.id.name != node.typeName['name'])
                return;
            result = path.node;
            path.stop();
        },
        ImportDeclaration(path) {
            for (const specifier of path.node.specifiers) {
                const alias = specifier.local.name;
                if (alias != node.typeName['name'])
                    continue;
                switch (specifier.type) {
                    case 'ImportNamespaceSpecifier':
                        break;
                    case 'ImportDefaultSpecifier':
                        break;
                    case 'ImportSpecifier':
                        specifier.imported.name;
                        break;
                }
                try {
                    const reference = glob
                        .sync(['.ts*', '/index.ts*'].map((key) => {
                        return join(directory, path.node.source.value).replace(/\\/g, '/') + key;
                    }))
                        .find((reference) => fs.existsSync(reference));
                    const content = fs.readFileSync(reference, 'utf8');
                    const filePath = resolve(directory, path.node.source.value + '.ts');
                    path.$ast ||= parse$1(content, {
                        allowImportExportEverywhere: true,
                        plugins: ['typescript'],
                        ranges: false
                    });
                    result = getType(dirname(filePath), path.$ast, node);
                }
                catch { }
                path.stop();
                break;
            }
        },
        TSInterfaceDeclaration(path) {
            if (path.node.id.name != node.typeName['name'])
                return;
            result = path.node;
            path.stop();
        },
        TSTypeAliasDeclaration(path) {
            if (path.node.id.name != node.typeName['name'])
                return;
            result = path.node.typeAnnotation;
            switch (result.type) {
                case 'TSUnionType':
                    const types = [];
                    for (const prev of result.types) {
                        const next = getType(directory, file, prev);
                        if (next.type == 'TSUnionType') {
                            next.types.forEach((type) => types.push(type));
                        }
                        else {
                            types.push(next);
                        }
                    }
                    result.types = types;
                    break;
                default:
                    result = getType(directory, file, result);
                    break;
            }
            path.stop();
        }
    });
    return result || node;
};

const getTypeReference = (file, node) => {
    if (!node)
        return;
    if (node.type != 'TSTypeReference')
        return;
    let result;
    visitor(file, {
        ImportDeclaration(path) {
            for (const specifier of path.node.specifiers) {
                const alias = specifier.local.name;
                if (alias != node.typeName['name'])
                    continue;
                switch (specifier.type) {
                    case 'ImportNamespaceSpecifier':
                        break;
                    case 'ImportDefaultSpecifier':
                        break;
                    case 'ImportSpecifier':
                        specifier.imported.name;
                        break;
                }
                result = path.node.source.value;
                path.stop();
                break;
            }
        }
    });
    return result;
};

const hasDecorator = (node, name) => {
    if (!node.decorators)
        return false;
    return !!node.decorators.some((decorator) => decorator.expression.callee?.name == name);
};

// TODO: add options
const print = (ast) => {
    return (generator.default || generator)(ast, { decoratorsBeforeExport: true }).code;
};

const CUSTOM_ELEMENT_OPTIONS = {
    prefix: undefined,
    typings: true
};
// TODO: support {variable && jsxElement}
const customElement = (options) => {
    const name = 'customElement';
    options = Object.assign({}, CUSTOM_ELEMENT_OPTIONS, options);
    const run = (context) => {
        const ast = t.cloneNode(context.fileAST, true);
        context.elementTagName = `${options.prefix || ''}${context.elementKey}`;
        context.elementInterfaceName = `HTML${pascalCase(context.elementTagName)}Element`;
        // attach tag name
        visitor(ast, {
            ClassDeclaration(path) {
                const { body, id } = path.node;
                if (id.name != context.className)
                    return;
                const node = t.classProperty(t.identifier(STATIC_TAG), t.stringLiteral(context.elementTagName), undefined, undefined, undefined, true);
                t.addComment(node, 'leading', COMMENT_AUTO_ADDED, true);
                body.body.unshift(node);
            }
        });
        // attach style mapper for 'style' attribute
        visitor(ast, {
            JSXAttribute(path) {
                const { name, value } = path.node;
                if (name.name != 'style')
                    return;
                if (!value)
                    return;
                if (value.type != 'JSXExpressionContainer')
                    return;
                const { local } = addDependency(path, UTILS_PATH, UTILS_STYLES_LOCAL, UTILS_STYLES_IMPORTED);
                // TODO: remove 'local!'
                path.replaceWith(t.jsxAttribute(t.jsxIdentifier('style'), t.jsxExpressionContainer(t.callExpression(t.identifier(local), [value.expression]))));
                path.skip();
            }
        });
        // replace 'className' attribute with 'class'
        visitor(ast, {
            JSXAttribute(path) {
                const { name, value } = path.node;
                if (name.name != 'className')
                    return;
                const hasClass = path.parentPath.node.attributes.some((attribute) => {
                    return attribute.name?.name == 'class';
                });
                if (hasClass)
                    return path.remove();
                path.replaceWith(t.jsxAttribute(t.jsxIdentifier('class'), value));
            }
        });
        // TODO
        visitor(ast, {
            JSXAttribute(path) {
                const { name, value } = path.node;
                if (name.name == 'value') {
                    name.name = '.' + name.name;
                    return;
                }
                const key = ['tabIndex', 'viewBox'];
                if (!key.includes(name.name))
                    return;
                path.replaceWith(t.jsxAttribute(t.jsxIdentifier(name.name.toLowerCase()), value));
            }
        });
        // TODO
        // convert 'jsx' to 'uhtml' syntax
        visitor(ast, {
            enter(path) {
                const { type } = path.node;
                if (!['JSXElement', 'JSXFragment'].includes(type))
                    return;
                const TODO = (node, attributes) => {
                    const { local } = addDependency(path, UTILS_PATH, UTILS_ATTRIBUTES_LOCAL, UTILS_ATTRIBUTES_IMPORTED);
                    return t.callExpression(t.identifier(local), [
                        node,
                        t.arrayExpression(attributes.map((attribute) => {
                            switch (attribute.type) {
                                case 'JSXSpreadAttribute':
                                    return attribute.argument;
                                default:
                                    return t.objectExpression([
                                        t.objectProperty(t.stringLiteral(attribute.name.name), attribute.value?.type == 'JSXExpressionContainer'
                                            ? attribute.value.expression
                                            : attribute.value || t.booleanLiteral(true))
                                    ]);
                            }
                        }))
                    ]);
                };
                const render = (node) => {
                    switch (node.type) {
                        case 'JSXElement':
                            const attributes = node.openingElement.attributes;
                            const isHost = node.openingElement.name.name == ELEMENT_HOST_NAME;
                            // TODO
                            if (isHost) {
                                const children = node.children.map(render).flat();
                                if (!attributes.length)
                                    return children;
                                return [TODO(t.thisExpression(), attributes), ...children];
                            }
                            const name = node.openingElement.name.name;
                            const children = node.children.map(render).flat();
                            const parts = [];
                            parts.push('<', name);
                            const hasSpreadAttribute = attributes.some((attribute) => {
                                return attribute.type == 'JSXSpreadAttribute';
                            });
                            if (hasSpreadAttribute) {
                                parts.push(' ', TODO(t.identifier('TODO'), attributes));
                            }
                            else {
                                for (const attribute of attributes) {
                                    switch (attribute.type) {
                                        case 'JSXAttribute':
                                            if (attribute.name.name == 'dangerouslySetInnerHTML') {
                                                try {
                                                    parts.push(' ', '.innerHTML');
                                                    parts.push('=');
                                                    parts.push(attribute.value.expression.properties.at(0).value);
                                                }
                                                catch { }
                                                continue;
                                            }
                                            parts.push(' ', attribute.name.name);
                                            if (!attribute.value)
                                                continue;
                                            parts.push('=');
                                            switch (attribute.value.type) {
                                                case 'JSXExpressionContainer':
                                                    parts.push(attribute.value.expression);
                                                    break;
                                                default:
                                                    parts.push(attribute.value.extra.raw);
                                                    break;
                                            }
                                            break;
                                        default:
                                            parts.push(' ', attribute);
                                            break;
                                    }
                                }
                            }
                            parts.push(node.closingElement ? '>' : ' />');
                            parts.push(...children);
                            if (node.closingElement) {
                                parts.push('<', '/', name, '>');
                            }
                            return parts;
                        case 'JSXFragment':
                            return node.children.map(render).flat();
                        case 'JSXText':
                            return [node.extra.raw];
                        case 'JSXExpressionContainer':
                            if (node.expression.type == 'JSXEmptyExpression')
                                return [];
                            return [node.expression];
                    }
                };
                const transform = (parts) => {
                    const quasis = [];
                    const expressions = [];
                    let i = 0;
                    while (i < parts.length + 1) {
                        let quasi = '';
                        while (typeof parts[i] == 'string') {
                            quasi += parts[i].replace(/[\\`]/g, (s) => `\\${s}`);
                            i += 1;
                        }
                        quasis.push(t.templateElement({ raw: quasi }));
                        if (parts[i] != null)
                            expressions.push(parts[i]);
                        i += 1;
                    }
                    const templateLiteral = t.templateLiteral(quasis, expressions);
                    // TODO
                    // if (!expressions.length) return template;
                    const { local } = addDependency(path, UTILS_PATH, UTILS_HTML_LOCAL, UTILS_HTML_IMPORTED, true);
                    return t.taggedTemplateExpression(t.identifier(local), templateLiteral);
                };
                path.replaceWith(transform(render(path.node)));
            }
        });
        // add type to properties
        visitor(ast, {
            Decorator(path) {
                const { expression } = path.node;
                if (expression.callee?.name != DECORATOR_PROPERTY)
                    return;
                if (!expression.arguments.length) {
                    expression.arguments.push(t.objectExpression([]));
                }
                const [argument] = expression.arguments;
                const property = argument.properties.find((property) => {
                    return property.key.name == DECORATOR_PROPERTY_TYPE;
                });
                if (property)
                    return;
                let type = 0;
                const extract = (input) => {
                    switch (input?.type) {
                        case 'bool':
                        case 'Boolean':
                        case 'BooleanLiteral':
                        case 'TSBooleanKeyword':
                            type |= TYPE_BOOLEAN;
                            break;
                        case 'Date':
                            type |= TYPE_DATE;
                            break;
                        case 'Number':
                        case 'NumericLiteral':
                        case 'TSNumberKeyword':
                            type |= TYPE_NUMBER;
                            break;
                        case 'StringLiteral':
                            type |= TYPE_ENUM;
                            break;
                        case 'TSStringKeyword':
                            type |= TYPE_STRING;
                            break;
                        case 'TSArrayType':
                            type |= TYPE_ARRAY;
                            break;
                        case 'TSLiteralType':
                            extract(input.literal);
                            break;
                        case 'TSNullKeyword':
                            type |= TYPE_NULL;
                            break;
                        case 'Object':
                        case 'TSObjectKeyword':
                            type |= TYPE_OBJECT;
                            break;
                        case 'Array':
                        case 'TSTupleType':
                            type |= TYPE_ARRAY;
                            break;
                        case 'TSTypeLiteral':
                            type |= TYPE_OBJECT;
                            break;
                        case 'TSTypeReference':
                            extract({ type: input?.typeName?.name });
                            break;
                        case 'TSUnionType':
                            input.types.forEach(extract);
                            break;
                        // TODO
                        case 'TSParenthesizedType':
                            if (input?.typeAnnotation?.type != 'TSIntersectionType')
                                break;
                            let types = input.types || input.typeAnnotation.types;
                            if (types.length != 2)
                                return;
                            types = types.filter((type) => type.type != 'TSTypeLiteral');
                            if (types.length != 1)
                                return;
                            extract(types[0]);
                            break;
                    }
                };
                extract(getType(context.directoryPath, ast, path.parentPath.node.typeAnnotation?.typeAnnotation));
                argument.properties.push(t.objectProperty(t.identifier(DECORATOR_PROPERTY_TYPE), t.numericLiteral(type)));
            }
        });
        // attach typings
        if (options.typings) {
            visitor(ast, {
                Program(path) {
                    const attributes = context
                        .classProperties.filter((property) => !t.isClassMethod(property))
                        .map((property) => {
                        const key = extractAttribute(property) || kebabCase(property.key['name']);
                        const typeAnnotation = property.typeAnnotation;
                        return Object.assign(t.tSPropertySignature(t.stringLiteral(kebabCase(key)), typeAnnotation), {
                            optional: property.optional,
                            leadingComments: t.cloneNode(property, true).leadingComments
                        });
                    });
                    const events = context.classEvents.map((event) => {
                        const key = event.key;
                        const typeAnnotation = event.typeAnnotation;
                        return Object.assign(t.tSPropertySignature(t.identifier(camelCase('on-' + key.name)), t.tsTypeAnnotation(t.tsFunctionType(undefined, [
                            Object.assign({}, t.identifier('event'), {
                                typeAnnotation: t.tsTypeAnnotation(t.tsTypeReference(t.identifier('CustomEvent'), typeAnnotation?.['typeAnnotation']?.typeParameters))
                            })
                        ], t.tsTypeAnnotation(t.tsVoidKeyword())))), {
                            optional: true,
                            leadingComments: t.cloneNode(event, true).leadingComments
                        });
                    });
                    const methods = context.classMethods.map((method) => {
                        return Object.assign(t.tsMethodSignature(method.key, undefined, method.params, // TODO
                        method.returnType // TODO
                        ), {
                            leadingComments: t.cloneNode(method, true).leadingComments
                        });
                    });
                    const properties = context.classProperties.map((property) => {
                        const key = property.key;
                        // TODO
                        const readonly = property.readonly || !!property['returnType'];
                        // TODO
                        const typeAnnotation = (property.typeAnnotation ||
                            property['returnType']);
                        return Object.assign(t.tsPropertySignature(t.identifier(key.name), typeAnnotation), {
                            readonly,
                            optional: property.optional,
                            leadingComments: t.cloneNode(property, true).leadingComments
                        });
                    });
                    // prettier-ignore
                    const ast = template.default.ast(`
              // THE FOLLOWING TYPES HAVE BEEN ADDED AUTOMATICALLY

              export interface ${context.className}Attributes {
                ${attributes.map(print).join('')}
              }

              export interface ${context.className}Events {
                ${events.map(print).join('')}
              }

              export interface ${context.className}Methods {
                ${methods.map(print).join('')}
              }

              export interface ${context.className}Properties {
                ${properties.map(print).join('')}
              }

              export interface ${context.className}JSX extends ${context.className}Events, ${context.className}Properties { }
    
              declare global {
                interface ${context.elementInterfaceName} extends HTMLElement, ${context.className}Methods, ${context.className}Properties { }

                var ${context.elementInterfaceName}: {
                  prototype: ${context.elementInterfaceName};
                  new (): ${context.elementInterfaceName};
                };

                interface HTMLElementTagNameMap {
                  "${context.elementTagName}": ${context.elementInterfaceName};
                }
                
                namespace JSX {
                  interface IntrinsicElements {
                    "${context.elementTagName}": ${context.className}Events & ${context.className}Attributes & {
                      [key: string]: any;
                    };
                  }
                }
              }

              export type ${context.className}Element = globalThis.${context.elementInterfaceName}
            `, {
                        plugins: ['typescript'],
                        preserveComments: true
                    });
                    path.node.body.push(...ast);
                }
            });
        }
        context.script = print(ast);
    };
    return { name, run };
};

const DOCUMENT_OPTIONS = {
    destination: path.join('dist', 'document.json')
};
const document = (options) => {
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
                    .split(DECORATOR_CSS_VARIABLE)
                    .slice(1)
                    .map((section) => {
                    const [first, second] = section.split(/\n/);
                    const description = first.replace('*/', '').trim();
                    const name = second.split(':')[0].trim();
                    const initializerDefault = second.split(':').slice(1).join(':').replace(';', '').trim();
                    // TODO
                    const initializerTransformed = context.styleContentTransformed
                        ?.split(name)
                        ?.at(1)
                        ?.split(':')
                        ?.filter((section) => !!section)
                        ?.at(0)
                        ?.split(/;|}/)
                        ?.at(0)
                        ?.trim();
                    const initializer = initializerTransformed || initializerDefault;
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

const extract = () => {
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
        context.classEvents = context.classMembers.filter((member) => hasDecorator(member, DECORATOR_EVENT));
        context.classMethods = context.classMembers.filter((member) => hasDecorator(member, DECORATOR_METHOD));
        context.classProperties = context.classMembers.filter((member) => hasDecorator(member, DECORATOR_PROPERTY));
        context.classStates = context.classMembers.filter((member) => hasDecorator(member, DECORATOR_STATE));
    };
    return { name, run };
};

const PARSE_OPTIONS = {
    sourceType: 'module',
    plugins: [['decorators', { decoratorsBeforeExport: true }], 'jsx', 'typescript']
};
const parse = (options) => {
    const name = 'parse';
    options = Object.assign({}, PARSE_OPTIONS, options);
    const run = (context) => {
        context.fileAST = parse$1(context.fileContent, options);
    };
    return { name, run };
};

const READ_OPTIONS = {
    encoding: 'utf8'
};
const read = (options) => {
    const name = 'read';
    options = Object.assign({}, READ_OPTIONS, options);
    const run = (context) => {
        if (!context.filePath)
            return;
        context.fileContent = fs.readFileSync(context.filePath, options);
        context.fileExtension = path.extname(context.filePath);
        context.fileName = path.basename(context.filePath, context.fileExtension);
        context.directoryPath = path.dirname(context.filePath);
        context.directoryName = path.basename(context.directoryPath);
    };
    return { name, run };
};

const README_OPTIONS = {
    source(context) {
        return path.join(context.directoryPath, `${context.fileName}.md`);
    }
};
const readme = (options) => {
    const name = 'readme';
    options = Object.assign({}, README_OPTIONS, options);
    const finish = (global) => {
        for (const context of global.contexts) {
            context.readmePath = options.source(context);
            if (!context.readmePath)
                continue;
            if (!fs.existsSync(context.readmePath))
                continue;
            context.readmeContent = fs.readFileSync(context.readmePath, 'utf8');
            context.readmeExtension = path.extname(context.readmePath);
            context.readmeName = path.basename(context.readmePath, context.readmeExtension);
        }
    };
    return { name, finish };
};

const STYLE_OPTIONS = {
    source(context) {
        return [
            path.join(context.directoryPath, `${context.fileName}.css`),
            path.join(context.directoryPath, `${context.fileName}.less`),
            path.join(context.directoryPath, `${context.fileName}.sass`),
            path.join(context.directoryPath, `${context.fileName}.scss`),
            path.join(context.directoryPath, `${context.fileName}.styl`)
        ];
    }
};
const style = (options) => {
    const name = 'style';
    options = Object.assign({}, STYLE_OPTIONS, options);
    const run = (context) => {
        const sources = [options.source(context)].flat();
        for (const source of sources) {
            if (!source)
                continue;
            if (!fs.existsSync(source))
                continue;
            context.stylePath = source;
            break;
        }
        if (!context.stylePath)
            return;
        context.styleContent = fs.readFileSync(context.stylePath, 'utf8');
        context.styleExtension = path.extname(context.stylePath);
        context.styleName = path.basename(context.stylePath, context.styleExtension);
        const { local } = addDependency(context.fileAST, context.stylePath, STYLE_IMPORTED, undefined, true);
        // TODO: remove 'local!'
        const property = t.classProperty(t.identifier(STATIC_STYLE), t.identifier(local), undefined, null, undefined, true);
        t.addComment(property, 'leading', COMMENT_AUTO_ADDED, true);
        context.class.body.body.unshift(property);
    };
    return { name, run };
};

const validate = () => {
    const name = 'validate';
    const run = (context) => {
        context.skipped = true;
        visitor(context.fileAST, {
            ImportDeclaration(path) {
                if (path.node.source?.value !== PACKAGE_NAME)
                    return;
                for (const specifier of path.node.specifiers) {
                    if (specifier.imported.name !== DECORATOR_ELEMENT)
                        continue;
                    const binding = path.scope.getBinding(specifier.imported.name);
                    if (binding.references == 0)
                        break;
                    const referencePaths = binding.referencePaths.filter((referencePath) => {
                        if (t.isCallExpression(referencePath.parent) &&
                            t.isDecorator(referencePath.parentPath.parent) &&
                            t.isClassDeclaration(referencePath.parentPath.parentPath.parent) &&
                            t.isExportNamedDeclaration(referencePath.parentPath.parentPath.parentPath.parent))
                            return true;
                    });
                    if (referencePaths.length > 1) {
                        throw new Error('In each file, only one custom element can be defined. \n' +
                            'If more than one @Element() decorator is used in the file, it will result in an error.\n');
                    }
                    context.skipped = false;
                    if (referencePaths.length == 1)
                        break;
                    throw new Error('It appears that the class annotated with the @Element() decorator is not being exported correctly.');
                }
                path.stop();
            }
        });
        context.skipped;
    };
    return { name, run };
};

const VISUAL_STUDIO_CODE_OPTIONS = {
    destination: path.join('dist', 'visual-studio-code.json')
};
const visualStudioCode = (options) => {
    const name = 'visualStudioCode';
    options = Object.assign({}, VISUAL_STUDIO_CODE_OPTIONS, options);
    const finish = (global) => {
        const contexts = global.contexts.sort((a, b) => {
            return a.elementKey.toUpperCase() > b.elementKey.toUpperCase() ? +1 : -1;
        });
        const json = {
            $schema: 'TODO',
            version: 1.1,
            tags: []
        };
        for (const context of contexts) {
            const tag = Object.assign({
                name: context.elementKey,
                attributes: [],
                references: [
                    {
                        name: 'Source code',
                        url: options.reference?.(context)
                    }
                ]
            }, extractFromComment(context.class, ['description']));
            for (const property of context.classProperties || []) {
                const attribute = Object.assign({
                    name: extractAttribute(property) || kebabCase(property.key['name']),
                    values: []
                }, extractFromComment(property, ['description']));
                const type = print(getType(context.directoryPath, context.fileAST, property.typeAnnotation?.['typeAnnotation']));
                const sections = type.split('|');
                for (const section of sections) {
                    const trimmed = section.trim();
                    if (!trimmed)
                        continue;
                    const isBoolean = /bool|boolean|Boolean/.test(trimmed);
                    const isNumber = !isNaN(trimmed);
                    const isString = /^("|'|`)/.test(trimmed);
                    if (isBoolean) {
                        attribute.values.push({
                            name: 'false'
                        }, {
                            name: 'true'
                        });
                    }
                    else if (isNumber) {
                        attribute.values.push({
                            name: trimmed
                        });
                    }
                    else if (isString) {
                        attribute.values.push({
                            name: trimmed.slice(1, -1)
                        });
                    }
                }
                tag.attributes.push(attribute);
            }
            const transformed = options.transformer?.(context, tag) || tag;
            json.tags.push(transformed);
        }
        const dirname = path.dirname(options.destination);
        fs.ensureDirSync(dirname);
        fs.writeJSONSync(options.destination, json, { encoding: 'utf8', spaces: 2 });
    };
    return { name, finish };
};

const WEB_TYPES_OPTIONS = {
    destination: path.join('dist', 'web-types.json'),
    packageName: '',
    packageVersion: ''
};
const webTypes = (options) => {
    const name = 'webTypes';
    options = Object.assign({}, WEB_TYPES_OPTIONS, options);
    const finish = (global) => {
        const contexts = global.contexts.sort((a, b) => {
            return a.elementKey.toUpperCase() > b.elementKey.toUpperCase() ? +1 : -1;
        });
        const json = {
            '$schema': 'http://json.schemastore.org/web-types',
            'name': options.packageName,
            'version': options.packageVersion,
            'description-markup': 'markdown',
            'framework-config': {
                'enable-when': {
                    'node-packages': [options.packageName]
                }
            },
            'contributions': {
                html: {
                    elements: []
                }
            }
        };
        for (const context of contexts) {
            const attributes = context.classProperties?.map((property) => Object.assign({
                name: extractAttribute(property) || kebabCase(property.key['name']),
                value: {
                    // kind: TODO
                    type: print(getType(context.directoryPath, context.fileAST, property.typeAnnotation?.['typeAnnotation']))
                    // required: TODO
                    // default: TODO
                },
                default: getInitializer(property.value)
            }, extractFromComment(property, ['description', 'deprecated', 'experimental'])));
            const events = context.classEvents?.map((event) => Object.assign({
                name: kebabCase(event.key['name']) // TODO
                // 'value': TODO
            }, extractFromComment(event, ['description', 'deprecated', 'experimental'])));
            const methods = context.classMethods?.map((method) => Object.assign({
                name: method.key['name']
                // 'value': TODO
            }, extractFromComment(method, ['description', 'deprecated', 'experimental'])));
            const properties = context.classProperties?.map((property) => Object.assign({
                name: property.key['name'],
                // 'value': TODO
                default: getInitializer(property.value)
            }, extractFromComment(property, ['description', 'deprecated', 'experimental'])));
            const element = Object.assign({
                'name': context.elementKey,
                'doc-url': options.reference?.(context),
                'js': {
                    events,
                    properties: [].concat(properties, methods)
                },
                attributes
            }, extractFromComment(context.class, ['description', 'deprecated', 'experimental', 'slots']));
            const transformed = options.transformer?.(context, element) || element;
            json.contributions.html.elements.push(transformed);
        }
        const dirname = path.dirname(options.destination);
        fs.ensureDirSync(dirname);
        fs.writeJSONSync(options.destination, json, { encoding: 'utf8', spaces: 2 });
    };
    return { name, finish };
};

export { ASSETS_OPTIONS, COPY_OPTIONS, CUSTOM_ELEMENT_OPTIONS, DOCUMENT_OPTIONS, PARSE_OPTIONS, README_OPTIONS, READ_OPTIONS, STYLE_OPTIONS, VISUAL_STUDIO_CODE_OPTIONS, WEB_TYPES_OPTIONS, assets, copy, customElement, document, extract, parse, read, readme, style, transformer, validate, visualStudioCode, webTypes };
