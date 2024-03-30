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
        var _a, _b, _c, _d, _e, _f, _g, _h;
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
            const attributes = (_a = context.classProperties) === null || _a === void 0 ? void 0 : _a.map((property) => {
                var _a;
                return Object.assign({
                    name: extractAttribute(property) || kebabCase(property.key['name']),
                    value: {
                        // kind: TODO
                        type: print(getType(context.directoryPath, context.fileAST, (_a = property.typeAnnotation) === null || _a === void 0 ? void 0 : _a['typeAnnotation']))
                        // required: TODO
                        // default: TODO
                    },
                    default: getInitializer(property.value)
                }, extractFromComment(property, ['description', 'deprecated', 'experimental']));
            });
            const events = (_b = context.classEvents) === null || _b === void 0 ? void 0 : _b.map((event) => Object.assign({
                name: kebabCase(event.key['name']) // TODO
                // 'value': TODO
            }, extractFromComment(event, ['description', 'deprecated', 'experimental'])));
            const methods = (_c = context.classMethods) === null || _c === void 0 ? void 0 : _c.map((method) => Object.assign({
                name: method.key['name']
                // 'value': TODO
            }, extractFromComment(method, ['description', 'deprecated', 'experimental'])));
            const properties = (_d = context.classProperties) === null || _d === void 0 ? void 0 : _d.map((property) => Object.assign({
                name: property.key['name'],
                // 'value': TODO
                default: getInitializer(property.value)
            }, extractFromComment(property, ['description', 'deprecated', 'experimental'])));
            const element = Object.assign({
                'name': context.elementKey,
                'doc-url': (_f = (_e = options).reference) === null || _f === void 0 ? void 0 : _f.call(_e, context),
                'js': {
                    events,
                    properties: [].concat(properties, methods)
                },
                attributes
            }, extractFromComment(context.class, ['description', 'deprecated', 'experimental', 'slots']));
            const transformed = ((_h = (_g = options).transformer) === null || _h === void 0 ? void 0 : _h.call(_g, context, element)) || element;
            json.contributions.html.elements.push(transformed);
        }
        const dirname = path.dirname(options.destination);
        fs.ensureDirSync(dirname);
        fs.writeJSONSync(options.destination, json, { encoding: 'utf8', spaces: 2 });
    };
    return { name, finish };
};
