import traverse from '@babel/traverse';
// TODO: options type
export const visitor = (ast, options) => {
    (traverse.default || traverse)(ast, options);
};
