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

    const skip: Array<string> = [];

    const getKey = (component) => component.componentClassName

    global.groups = Object.values<any>(global.contexts)
      .sort((a, b) => getKey(b).length - getKey(a).length)
      .map((component, index, components) => ({
        key: getKey(component),
        components: components.filter((current) => getKey(current).startsWith(getKey(component)))
      }))
      .sort((a, b) => b.components.length - a.components.length)
      .filter((group) => {
        if (skip.includes(group.key)) return;
        group.components.forEach((component) => skip.push(getKey(component)))
        return true
      })
      .map((group) => {
        const root = group.components.find((component) => getKey(component) == group.key);
        const all = group.components.map((component) => ({
          ...component,
          componentClassNameInCategory: getKey(component).replace(group.key, '')
        })).reverse()
        const filterd = all.filter((component) => getKey(component) != group.key);
        return {
          single: !filterd.length,
          root,
          all,
          filterd,
        }
      })

    if (await isDirectoryEmpty(options.dist)) {
      renderTemplate(['templates/**', `!${component}`], options.dist, config)(global);
    } else {
      renderTemplate(['templates/src/proxy*', 'templates/src/components/index*'], options.dist, config)(global);
    }

    for (const group of global.groups) {
      renderTemplate(component, options.dist, config)({
        options,
        fileName: group.root.fileName,
        ...group,
      });
    }
  };

  return {
    name,
    finish
  };
};
