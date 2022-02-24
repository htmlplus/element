import { isDirectoryEmpty, renderTemplate } from '../../utils/index.js';

export interface ReactProxyOptions {
  dist: string;
  categorize?: boolean;
}

export const reactProxy = (options: ReactProxyOptions) => {
  const name = 'reactProxy';

  const finish = (global) => {
    const contexts = global.contexts;

    const config = { cwd: import.meta.url };

    const component = 'templates/src/components/[fileName]*';

    const pattenrs = isDirectoryEmpty(options.dist) ? ['templates/**/*', `!${component}`] : ['templates/src/proxy*'];

    renderTemplate(pattenrs, options.dist, config)(global);

    for (const key in Object.keys(contexts)) {
      renderTemplate(component, options.dist, config)(contexts[key]);
    }
  };

  return {
    name,
    finish
  };
};
