import { parse as parser } from '@babel/parser';
export const PARSE_OPTIONS = {
    sourceType: 'module',
    plugins: [['decorators', { decoratorsBeforeExport: true }], 'jsx', 'typescript']
};
export const parse = (options) => {
    const name = 'parse';
    options = Object.assign({}, PARSE_OPTIONS, options);
    const run = (context) => {
        context.fileAST = parser(context.fileContent, options);
    };
    return { name, run };
};
