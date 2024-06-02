import { kebabCase } from 'change-case';
import fs from 'fs-extra';
import path from 'path';
import { extractAttribute, extractFromComment, getInitializer, getType, print } from '../utils/index.js';
export const WEB_TYPES_OPTIONS = {
    destination: path.join('dist', 'web-types.json'),
    packageName: '',
    packageVersion: ''
};
export const webTypes = (options) => {
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
