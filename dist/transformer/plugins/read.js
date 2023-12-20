import fs from 'fs-extra';
import path from 'path';
export const READ_OPTIONS = {
    encoding: 'utf8'
};
export const read = (options) => {
    const name = 'read';
    options = Object.assign({}, READ_OPTIONS, options);
    const run = (context) => {
        var _a;
        if (!context.filePath)
            return;
        (_a = context.fileContent) !== null && _a !== void 0 ? _a : (context.fileContent = fs.readFileSync(context.filePath, options));
        context.fileExtension = path.extname(context.filePath);
        context.fileName = path.basename(context.filePath, context.fileExtension);
        context.directoryPath = path.dirname(context.filePath);
        context.directoryName = path.basename(context.directoryPath);
    };
    return { name, run };
};
