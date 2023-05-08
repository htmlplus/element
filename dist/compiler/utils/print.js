import generator from '@babel/generator';
// TODO: add options
export const print = (ast) => {
    return (generator.default || generator)(ast, { decoratorsBeforeExport: true }).code;
};
