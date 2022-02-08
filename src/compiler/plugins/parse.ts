import { parse as parser } from '@babel/parser';

import { Context } from '../../types';

export const parse = () => {
  const name = 'parse';

  const next = (context: Context) => {
    if (!!context.fileAST) return;
    context.fileAST = parser(context.fileContent!, {
      allowImportExportEverywhere: true,
      plugins: ['jsx', 'typescript', 'decorators-legacy']
    });
  };

  return {
    name,
    next
  };
};
