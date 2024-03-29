import { kebabCase } from 'change-case';
import fs from 'fs-extra';
import path from 'path';
import { extractFromComment, getType, print } from '../utils/index.js';
export const VISUAL_STUDIO_CODE_OPTIONS = {
    destination: path.join('dist', 'visual-studio-code.json')
};
export const visualStudioCode = (options) => {
    const name = 'visualStudioCode';
    options = Object.assign({}, VISUAL_STUDIO_CODE_OPTIONS, options);
    const finish = (global) => {
        var _a, _b, _c, _d, _e;
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
                        url: (_b = (_a = options).reference) === null || _b === void 0 ? void 0 : _b.call(_a, context)
                    }
                ]
            }, extractFromComment(context.class, ['description']));
            for (const property of context.classProperties || []) {
                const attribute = Object.assign({
                    name: kebabCase(property.key['name']),
                    values: []
                }, extractFromComment(property, ['description']));
                const type = print(getType(context.directoryPath, context.fileAST, (_c = property.typeAnnotation) === null || _c === void 0 ? void 0 : _c['typeAnnotation']));
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
            const transformed = ((_e = (_d = options).transformer) === null || _e === void 0 ? void 0 : _e.call(_d, context, tag)) || tag;
            json.tags.push(transformed);
        }
        const dirname = path.dirname(options.destination);
        fs.ensureDirSync(dirname);
        fs.writeJSONSync(options.destination, json, { encoding: 'utf8', spaces: 2 });
    };
    return { name, finish };
};
