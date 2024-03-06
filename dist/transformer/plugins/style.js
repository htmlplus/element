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
        const { local } = addDependency(context.fileAST, context.stylePath, CONSTANTS.STYLE_IMPORTED, undefined, true);
        // TODO: remove 'local!'
        const property = t.classProperty(t.identifier(CONSTANTS.STATIC_STYLE), t.identifier(local), undefined, null, undefined, true);
        t.addComment(property, 'leading', CONSTANTS.COMMENT_AUTO_ADDED, true);
        context.class.body.body.unshift(property);
    };
    return { name, run };
};
