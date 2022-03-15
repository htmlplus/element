import { __dirname, isDirectoryEmpty, renderTemplate } from '../../utils/index.js';

const defaults: ReactProxyOptions = {
  categorize: false,
  corePackageName: 'your_package',
  dist: '',
  importerComponent(context) {
    return `your_package#${context.componentClassName}`;
  },
  importerComponentType(context) {
    return `your_package#JSX.${context.componentClassName}`;
  }
};

export interface ReactProxyOptions {
  categorize?: boolean;
  corePackageName?: string;
  dist: string;
  importerComponent?: (context) => string;
  importerComponentType?: (context) => string;
}

export const reactProxy = (options: ReactProxyOptions) => {
  const name = 'react-proxy';

  const finish = async (global) => {
    options = Object.assign({}, defaults, options);

    const config = { cwd: __dirname(import.meta.url) };

    const component = 'templates/src/components/*fileName*';

    global = Object.assign({}, global, { options });

    const skip: Array<string> = [];

    const getKey = (component) => component.componentClassName;

    global.groups = Object.values<any>(global.contexts)
      .sort((a, b) => getKey(b).length - getKey(a).length)
      .map((component, index, components) => ({
        key: getKey(component),
        components: components.filter((current) => getKey(current).startsWith(getKey(component)))
      }))
      .sort((a, b) => b.components.length - a.components.length)
      .filter((group) => {
        if (skip.includes(group.key)) return;
        group.components.forEach((component) => skip.push(getKey(component)));
        return true;
      })
      .map((group) => {
        const root = group.components.find((component) => getKey(component) == group.key);
        const all = group.components
          .reverse()
          .map((component) => {
            const componentClassNameInCategory = getKey(component).replace(group.key, '');

            const parse = (input) => {
              const [source, key] = input.split('#');
              const [root, ...sub] = key.split('.');
              const local = root + (index + 1);
              const variable = sub.length ? local + '.' + sub.join('.') : local;
              return {
                source,
                variable,
                root,
                local,
              }
            }

            const {
              source: componentSource,
              variable: componentVariable,
              root: componentVariableRoot,
              local: componentVariableRootLocal,
            } = parse(options.importerComponent!(component));

            const {
              source: componentTypeSource,
              variable: componentTypeVariable,
              root: componentTypeVariableRoot,
              local: componentTypeVariableRootLocal,
            } = parse(options.importerComponentType!(component));

            return Object.assign(Object.assign({}, component), {
              componentClassNameInCategory,
              componentSource,
              componentVariable,
              componentVariableRoot,
              componentVariableRootLocal,
              componentTypeSource,
              componentTypeVariable,
              componentTypeVariableRoot,
              componentTypeVariableRootLocal
            });
          });
        const filterd = all.filter((component) => getKey(component) != group.key);
        return {
          single: !filterd.length,
          root,
          all,
          filterd
        };
      })
      .sort((a, b) => (getKey(a.root) < getKey(b.root) ? -1 : 0));

    if (await isDirectoryEmpty(options.dist)) {
      renderTemplate(['templates/**', `!${component}`], options.dist, config)(global);
    } else {
      renderTemplate(['templates/src/proxy*', 'templates/src/components/index*'], options.dist, config)(global);
    }

    for (const group of global.groups) {
      const state = {
        options,
        fileName: group.root.fileName,
        ...group,
      };
      renderTemplate(component, options.dist, config)(state);
    }
  };

  return {
    name,
    finish
  };
};
