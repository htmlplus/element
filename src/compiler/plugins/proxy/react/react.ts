import fs from 'fs';
import path from 'path';

import { Context } from '../../../../types/index.js';
import { getTemplate } from '../../../utils/index.js';

export interface ReactProxyOptions {
  dist: string;
}

export const reactProxy = (options: ReactProxyOptions) => {
  const name = 'reactProxy';

  const next = (context: Context) => {
    debugger;
    const a = getTemplate(import.meta.url, 'templates/src/[component].ts.hbs')(context);
    if (!fs.existsSync(path.resolve(options.dist, `src`))) {
      fs.mkdirSync(path.resolve(options.dist, `src`), { recursive: true });
    }
    fs.writeFileSync(path.resolve(options.dist, `src/${context.fileName}.ts`), a, 'utf8');
  };

  const finish = (global) => {
    // fs.copyFileSync('templates/proxy.ts.hbs', options.dist + 'proxy.ts');
  };

  return {
    name,
    next,
    finish
  };
};
