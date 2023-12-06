import fs from 'fs-extra';
import path from 'path';
export const README_OPTIONS = {
    source(context) {
        return path.join(context.directoryPath, `${context.fileName}.md`);
    }
};
export const readme = (options) => {
    const name = 'readme';
    options = Object.assign({}, README_OPTIONS, options);
    const finish = (global) => {
        var _a;
        for (const context of global.contexts) {
            context.readmePath = (_a = options.source) === null || _a === void 0 ? void 0 : _a.call(options, context);
            if (!context.readmePath)
                continue;
            if (!fs.existsSync(context.readmePath))
                continue;
            context.readmeContent = fs.readFileSync(context.readmePath, 'utf8');
        }
    };
    return { name, finish };
};
