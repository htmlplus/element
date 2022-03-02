import { __dirname, isDirectoryEmpty, renderTemplate } from '../../utils/index.js';

export interface ReactProxyOptions {
  dist: string;
  corePackageName: string;
  categorize?: boolean;
}

export const reactProxy = (options: ReactProxyOptions) => {
  const name = 'reactProxy';

  const finish = async (global) => {
    global = Object.assign({}, global, { options });

    const contexts = global.contexts;

    if (options.categorize) {
      const skip: Array<string> = [];
      global.groups = Object.values<any>(global.contexts)
        .sort((a, b) => b.componentClassName.length - a.componentClassName.length)
        .map((component, index, components) => {
          const key = component.componentClassName;
          const filterd = components.filter(component => component.componentClassName.startsWith(key));
          return [key, filterd]
        })
        .filter((group) => group)
        .sort((a, b) => b[1].length - a[1].length)
        .filter((group) => {
          const [key, components] = group as any;
          if (skip.includes(key)) return;
          components.forEach((component) => skip.push(component.componentClassName))
          return true
        })
    }
    else {
      global.groups = Object.values<any>(global.contexts).map((component) => [component.componentClassName, [component]])
    }

    const config = { cwd: __dirname(import.meta.url) };

    const component = 'templates/src/components/{{fileName}}*';

    if (await isDirectoryEmpty(options.dist)) {
      renderTemplate(['templates/**', `!${component}`], options.dist, config)(global);
    } else {
      renderTemplate(['templates/src/proxy*', 'templates/src/components/index*'], options.dist, config)(global);
    }

    for (const key of Object.keys(contexts)) {
      const root = contexts[key];
      const fileName = root.fileName;
      const components = [root];
      const single = components.length == 1;
      const context = {
        options,
        components,
        fileName,
        root,
        single
      };
      renderTemplate(component, options.dist, config)(context);
    }
  };

  return {
    name,
    finish
  };
};
