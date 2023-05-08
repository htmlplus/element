import fs from 'fs-extra';
export const READ_OPTIONS = {
    encoding: 'utf8'
};
export const read = (options) => {
    const name = 'read';
    options = Object.assign({}, READ_OPTIONS, options);
    const run = (context) => {
        var _a;
        context.fileContent = (_a = context.fileContent) !== null && _a !== void 0 ? _a : fs.readFileSync(context.filePath, options);
    };
    return { name, run };
};
