import { renderTemplate } from '../../../utils/index.js';

export interface ReactProxyOptions {
  dist: string;
}

export const reactProxy = (options: ReactProxyOptions) => {
  const name = 'reactProxy';

  const finish = (global) => {
    const component = 'templates/src/components/[component]';
    Object.keys(global.contexts).forEach((context) => {
      renderTemplate(import.meta.url, component)(context);
    });
    if (false /*dirty*/) {
      renderTemplate(import.meta.url, 'templates/src/proxy')(global);
      return;
    }
    renderTemplate(import.meta.url, ['templates/**/*', '!' + component])(global);
  };

  return {
    name,
    finish
  };
};
