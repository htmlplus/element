import { __dirname, isDirectoryEmpty, renderTemplate } from '../../utils/index.js';

const defaults: ReactProxyOptions = {
  categorize: false,
  dist: '',
  eventName: undefined,
  importerComponent(context) {
    return `YOUR_CORE_PACKAGE_NAME#${context.componentClassName}`;
  },
  importerComponentType(context) {
    return `YOUR_CORE_PACKAGE_NAME#JSX.${context.componentClassName}`;
  }
};

export interface ReactProxyOptions {
  categorize?: boolean;
  dist: string;
  eventName?: (eventName: string) => string,
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
        const all = group.components
          .reverse()
          .map((component, index) => {
            const componentClassNameInCategory = getKey(component).replace(group.key, '');

            const parse = (input) => {
              const [source, key] = input.split('#');
              const [root, ...sub] = key.split('.');
              const local = root + (index + 1);
              const variable = [local, ...sub].join('.')
              return {
                source,
                variable,
                root,
                local,
              }
            }

            const importerComponent = parse(options.importerComponent!(component))
            const importerComponentType = parse(options.importerComponentType!(component))

            return {
              ...component,
              componentClassNameInCategory,
              importerComponent,
              importerComponentType,
            };
          });
        return {
          all,
          filterd: all.slice(1),
          root: all.at(0),
          single: all.length == 1,
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
