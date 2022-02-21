import { Context } from '../../../../types/index.js';
import { copyTemplate } from '../../../utils/index.js';

export interface ReactProxyOptions {
  dist: string;
}

export const reactProxy = (options: ReactProxyOptions) => {
  const name = 'reactProxy';

  const ignore = 'templates/src/components/[component]';

  const next = (context: Context) => {
    copyTemplate(import.meta.url, ignore)(context);
  };

  const finish = (global) => {
    copyTemplate(import.meta.url, ['templates/**/*', `!${ignore}`])(global);
  };

  return {
    name,
    next,
    finish
  };
};
