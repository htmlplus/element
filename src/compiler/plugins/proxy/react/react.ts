import { renderTemplate } from '../../../utils/index.js';

export interface ReactProxyOptions {
  dist: string;
}

export const reactProxy = (options: ReactProxyOptions) => {
  const name = 'reactProxy';

  const finish = (global) => {
    const component = 'templates/src/components/[component]*';
    const config = { cwd: import.meta.url };
    Object.keys(global.contexts).forEach((context) => {
      renderTemplate(component, options.dist, config)(context);
    });
    if (false /*dirty*/) {
      renderTemplate('templates/src/proxy*', options.dist, config)(global);
      return;
    }
    renderTemplate(['templates/**/*', '!' + component], options.dist, config)(global);
  };

  return {
    name,
    finish
  };
};
