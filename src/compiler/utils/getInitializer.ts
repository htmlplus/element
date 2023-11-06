import t from '@babel/types';

export const getInitializer = (node: t.Expression): string | undefined => {
  return node?.extra?.raw || node?.['value'];
};
