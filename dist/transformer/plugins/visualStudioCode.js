import { kebabCase } from 'change-case';
import fs from 'fs-extra';
import path from 'path';
import { getTags, getType, print } from '../utils/index.js';
export const VISUAL_STUDIO_CODE_OPTIONS = {};
export const visualStudioCode = (options) => {
    const name = 'visualStudioCode';
    options = Object.assign({}, VISUAL_STUDIO_CODE_OPTIONS, options);
    const finish = (global) => {
        var _a, _b, _c, _d, _e;
        const contexts = global.contexts.sort((a, b) => {
            return a.componentKey.toUpperCase() > b.componentKey.toUpperCase() ? +1 : -1;
        });
        const json = {
            $schema: 'TODO',
            version: 1.1,
            tags: []
        };
        for (const context of contexts) {
            const description = (_a = getTags(context.class).find((tag) => !tag.key)) === null || _a === void 0 ? void 0 : _a.value;
            const tag = {
                name: context.componentKey,
                description: description,
                attributes: [],
                references: [
                    {
                        name: 'Source code',
                        url: (_b = options.reference) === null || _b === void 0 ? void 0 : _b.call(options, context)
                    }
                ]
            };
            for (const property of context.classProperties || []) {
                const attribute = {
                    name: kebabCase(property.key['name']),
                    description: (_c = getTags(property).find((tag) => !tag.key)) === null || _c === void 0 ? void 0 : _c.value,
                    values: []
                };
                const type = print(getType(context.directoryPath, context.fileAST, (_d = property.typeAnnotation) === null || _d === void 0 ? void 0 : _d['typeAnnotation']));
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
            const transformed = ((_e = options.transformer) === null || _e === void 0 ? void 0 : _e.call(options, context, tag)) || tag;
            json.tags.push(transformed);
        }
        const dirname = path.dirname(options.destination);
        fs.ensureDirSync(dirname);
        fs.writeJSONSync(options.destination, json, { encoding: 'utf8', spaces: 2 });
    };
    return { name, finish };
};
