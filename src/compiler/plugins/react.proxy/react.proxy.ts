import { __dirname, isDirectoryEmpty, renderTemplate } from '../../utils/index.js';

const defaults: ReactProxyOptions = {
  compact: false,
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
  compact?: boolean;
  dist: string;
  eventName?: (eventName: string) => string;
  importerComponent?: (context) => string;
  importerComponentType?: (context) => string;
}

export const reactProxy = (options: ReactProxyOptions) => {
  const name = 'react-proxy';

  const finish = (global) => {
    options = { ...defaults, ...options };

    global = { ...global, options };

    const config = { cwd: __dirname(import.meta.url) };

    const isEmpty = isDirectoryEmpty(options.dist);

    const skip: Array<string> = [];

    const getKey = (component) => component.componentClassName;

    for (const key in global.contexts) {
      const context = global.contexts[key];

      const parse = (input) => {
        const [source, key] = input.split('#');
        const [root, ...sub] = key.split('.');
        const variable = ['Type', ...sub].join('.');
        return {
          source,
          variable,
          root
        };
      };

      const classEvents = context.classEvents.map((classEvent) => {
        return {
          ...classEvent,
          converted: options.eventName!(classEvent.key.name)
        };
      });

      const fileName = context.fileName;

      const importerComponent = parse(options.importerComponent!(context));

      const importerComponentType = parse(options.importerComponentType!(context));

      const state = {
        ...context,
        classEvents,
        fileName,
        importerComponent,
        importerComponentType,
        options
      };

      const patterns = [
        'templates/src/components/*fileName*.ts.hbs',
        '!templates/src/components/*fileName*.compact.ts.hbs'
      ];

      renderTemplate(patterns, options.dist, config)(state);
    }

    if (options.compact) {
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
          const all = group.components.reverse().map((component, index) => {
            const componentClassNameInCategory = getKey(component).replace(group.key, '');

            const parse = (input) => {
              const [source, key] = input.split('#');
              const [root, ...sub] = key.split('.');
              const local = root + (index + 1);
              const variable = [local, ...sub].join('.');
              return {
                source,
                variable,
                root,
                local
              };
            };

            const importerComponent = parse(options.importerComponent!(component));
            const importerComponentType = parse(options.importerComponentType!(component));

            return {
              ...component,
              componentClassNameInCategory,
              importerComponent,
              importerComponentType
            };
          });
          return {
            all,
            filterd: all.slice(1),
            root: all.at(0),
            single: all.length == 1
          };
        })
        .sort((a, b) => (getKey(a.root) < getKey(b.root) ? -1 : 0));

      for (const group of global.groups) {
        if (group.single) continue;
        const state = {
          fileName: group.root.fileName,
          options,
          ...group
        };
        const patterns = ['templates/src/components/*fileName*.compact.ts.hbs'];
        renderTemplate(patterns, options.dist, config)(state);
      }
    }

    if (isEmpty) {
      const patterns = [
        'templates/**',
        '!templates/src/components/*fileName*.ts.hbs',
        '!templates/src/components/*fileName*.compact.ts.hbs'
      ];
      renderTemplate(patterns, options.dist, config)(global);
    }

    if (!isEmpty) {
      const patterns = ['templates/src/proxy*', 'templates/src/components/index*'];
      renderTemplate(patterns, options.dist, config)(global);
    }
  };

  return {
    name,
    finish
  };
};
