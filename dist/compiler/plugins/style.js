import t from '@babel/types';
import fs from 'fs-extra';
import path from 'path';
import * as CONSTANTS from '../../constants/index.js';
import { addDependency } from '../utils/index.js';
export const STYLE_OPTIONS = {
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
export const style = (options) => {
    const name = 'style';
    options = Object.assign({}, STYLE_OPTIONS, options);
    const run = (context) => {
        var _a;
        const sources = [(_a = options === null || options === void 0 ? void 0 : options.source) === null || _a === void 0 ? void 0 : _a.call(options, context)].flat();
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
        const { local } = addDependency(context.fileAST, context.stylePath, CONSTANTS.STYLE_IMPORTED);
        // TODO: remove 'local!'
        const property = t.classProperty(t.identifier(CONSTANTS.STATIC_STYLES), t.identifier(local), undefined, null, undefined, true);
        t.addComment(property, 'leading', CONSTANTS.COMMENT_AUTO_ADDED_PROPERTY, true);
        context.class.body.body.unshift(property);
    };
    return { name, run };
};
