import { __dirname, isDirectoryEmpty, renderTemplate } from '../../utils/index.js';

export interface ReactProxyOptions {
  dist: string;
  corePackageName: string;
  categorize?: boolean;
}

export const reactProxy = (options: ReactProxyOptions) => {
  const name = 'reactProxy';

  const finish = async (global) => {
    const config = { cwd: __dirname(import.meta.url) };

    const component = 'templates/src/components/{{fileName}}*';

    global = Object.assign({}, global, { options });

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
        .map((group) => {
          const [key, components] = group as any;
          return {
            root: components.find((component) => component.componentClassName == key),
            filterd: components.filter((component) => component.componentClassName != key).map((component) => ({ ...component, componentClassNameInCategory: component.componentClassName.replace(key, '') })),
            all: components.map((component) => ({ ...component, componentClassNameInCategory: component.componentClassName.replace(key, '') })),
          }
        })
    }
    else {
      global.groups = Object.values<any>(global.contexts).map((component) => ({
        single: true,
        root: component,
        filterd: [],
        all: [component]
      }))
    }

    if (await isDirectoryEmpty(options.dist)) {
      renderTemplate(['templates/**', `!${component}`], options.dist, config)(global);
    } else {
      renderTemplate(['templates/src/proxy*', 'templates/src/components/index*'], options.dist, config)(global);
    }

    for (const group of global.groups) {
      renderTemplate(component, options.dist, config)({
        options,
        ...group,
        fileName: group.root.fileName,
      });
    }
  };

  return {
    name,
    finish
  };
};
