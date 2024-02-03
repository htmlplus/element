import generator from '@babel/generator';
import { Node } from '@babel/types';

// TODO: add options
export const print = (ast: Node): string => {
  return (generator.default || generator)(ast, { decoratorsBeforeExport: true }).code;
};
