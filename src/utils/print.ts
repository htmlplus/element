import generator from '@babel/generator';
import { Node } from '@babel/types';

export const print = (ast: Node): string => {
  return (generator.default || generator)(ast).code;
}