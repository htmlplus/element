import { Context } from '../../../../types/index.js';
import { getTemplate } from '../../../utils/index.js';

export interface ReactProxyOptions {
  dist: string;
}

export const reactProxy = (options: ReactProxyOptions) => {
  const name = 'reactProxy';

  const next = (context: Context) => {
    debugger;
    console.log(9999, getTemplate(import.meta.url, 'templates/[component].ts.hbs')(context));
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
