import { isDirectoryEmpty, renderTemplate } from '../../utils/index.js';

export interface ReactProxyOptions {
  dist: string;
  categorize?: boolean;
}

export const reactProxy = (options: ReactProxyOptions) => {
  const name = 'reactProxy';

  const finish = (global) => {
    const config = { cwd: import.meta.url };
    const component = 'templates/src/components/[fileName]*';
    const pattenrs = isDirectoryEmpty(options.dist) ? ['templates/**/*', `!${component}`] : ['templates/src/proxy*'];

    renderTemplate(pattenrs, options.dist, config)(global);

    Object.keys(global.contexts).forEach((key) => {
      const context = global.contexts[key];
      renderTemplate(component, options.dist, config)(context);
    });
  };

  return {
    name,
    finish
  };
};
