import generator from '@babel/generator';
import { Node } from '@babel/types';

// TODO: add options
export const print = (ast: Node): string => {
  // TODO: the `ast` should not be undefined
  if (!ast) return '';
  return (generator.default || generator)(ast as any, { decoratorsBeforeExport: true }).code;
};
