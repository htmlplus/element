import fs from 'fs';

import { Context } from '../../types';

export const read = () => {
  const name = 'read';

  const next = (context: Context) => {
    if (!!context.fileContent) return;
    context.fileContent = fs.readFileSync(context.filePath!, 'utf8');
  };

  return {
    name,
    next
  };
};
