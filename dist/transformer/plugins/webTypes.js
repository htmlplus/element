import { kebabCase } from 'change-case';
import fs from 'fs-extra';
import path from 'path';
import { getInitializer, getTags, getType, hasTag, parseTag, print } from '../utils/index.js';
export const WEB_TYPES_OPTIONS = {};
export const webTypes = (options) => {
    const name = 'webTypes';
    options = Object.assign({}, WEB_TYPES_OPTIONS, options);
    const finish = (global) => {
        var _a, _b, _c, _d, _e, _f, _g;
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
        const common = (member) => {
            var _a;
            return ({
                name: member.key['name'],
                description: (_a = getTags(member).find((tag) => !tag.key)) === null || _a === void 0 ? void 0 : _a.value,
                deprecated: hasTag(member, 'deprecated'),
                experimental: hasTag(member, 'experimental')
            });
        };
        for (const context of contexts) {
            const attributes = (_a = context.classProperties) === null || _a === void 0 ? void 0 : _a.map((property) => {
                var _a;
                return Object.assign(common(property), {
                    name: kebabCase(property.key['name']),
                    value: {
                        // kind: TODO
                        type: print(getType(context.directoryPath, context.fileAST, (_a = property.typeAnnotation) === null || _a === void 0 ? void 0 : _a['typeAnnotation']))
                        // required: TODO
                        // default: TODO
                    },
                    default: getInitializer(property.value)
                });
            });
            const description = (_b = getTags(context.class).find((tag) => !tag.key)) === null || _b === void 0 ? void 0 : _b.value;
            const events = (_c = context.classEvents) === null || _c === void 0 ? void 0 : _c.map((event) => Object.assign(common(event), {
                name: kebabCase(event.key['name']) // TODO
                // 'value': TODO
            }));
            const methods = (_d = context.classMethods) === null || _d === void 0 ? void 0 : _d.map((method) => Object.assign(common(method), {
            // 'value': TODO
            }));
            const properties = (_e = context.classProperties) === null || _e === void 0 ? void 0 : _e.map((property) => Object.assign(common(property), {
                // 'value': TODO
                default: getInitializer(property.value)
            }));
            const slots = getTags(context.class, 'slot').map((tag) => {
                const { description, name } = parseTag(tag);
                return {
                    name,
                    description
                };
            });
            const element = {
                'name': context.elementKey,
                'description': description,
                'doc-url': (_f = options.reference) === null || _f === void 0 ? void 0 : _f.call(options, context),
                'deprecated': hasTag(context.class, 'deprecated'),
                'experimental': hasTag(context.class, 'experimental'),
                'js': {
                    events,
                    properties: [].concat(properties, methods)
                },
                attributes,
                slots
            };
            const transformed = ((_g = options.transformer) === null || _g === void 0 ? void 0 : _g.call(options, context, element)) || element;
            json.contributions.html.elements.push(transformed);
        }
        const dirname = path.dirname(options.destination);
        fs.ensureDirSync(dirname);
        fs.writeJSONSync(options.destination, json, { encoding: 'utf8', spaces: 2 });
    };
    return { name, finish };
};
