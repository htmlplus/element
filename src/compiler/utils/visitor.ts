import traverse from '@babel/traverse';
import { Node } from '@babel/types';

// TODO: options type
export const visitor = (ast: Node, options: any): void => {
  (traverse.default || traverse)(ast, options);
};
