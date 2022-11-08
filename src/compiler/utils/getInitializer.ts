import { Expression } from '@babel/types';

export const getInitializer = (node: Expression): string | undefined => {
  return node?.extra?.raw || node?.['value'];
};
