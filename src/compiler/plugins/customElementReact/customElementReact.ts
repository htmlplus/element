import { pascalCase } from 'change-case';

import { Context, Global } from '../../../types';
import { __dirname, isDirectoryEmpty, renderTemplate } from '../../utils/index.js';

export const CUSTOM_ELEMENT_REACT_OPTIONS: Partial<CustomElementReactOptions> = {};

export interface CustomElementReactOptions {
  compact?: boolean;
  destination: string;
  eventName?: (eventName: string) => string;
  importerComponent: (context: Context) => { source: string };
  importerComponentType: (context: Context) => { source: string; imported: string; local: string };
}

export const customElementReact = (options: CustomElementReactOptions) => {
  const name = 'customElementReact';

  options = Object.assign({}, CUSTOM_ELEMENT_REACT_OPTIONS, options);

  const finish = (global: Global) => {
    // TODO
    const globalNew: any = {
      contexts: global.contexts.reduce((previous, current) => ({ ...previous, [current.filePath!]: current }), {}),
      options
    };

    const config = { cwd: __dirname(import.meta.url) };

    const isEmpty = isDirectoryEmpty(options.destination);

    const skip: Array<string> = [];

    const getKey = (component) => component.className;

    for (const key in globalNew.contexts) {
      const context = globalNew.contexts[key];

      const classEvents = context.classEvents.map((classEvent) => {
        const from = 'on' + pascalCase(classEvent.key.name);
        const to = options.eventName?.(from) ?? from;
        return {
          ...classEvent,
          from,
          to
        };
      });

      const fileName = context.fileName;

      const importerComponent = options.importerComponent(context);

      const importerComponentType = options.importerComponentType(context);

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

      renderTemplate(patterns, options.destination, config)(state);
    }

    if (options.compact) {
      globalNew.groups = Object.values<any>(globalNew.contexts)
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

              const importerComponent = options.importerComponent(component);

              const importerComponentType = options.importerComponentType(component);

              return {
                ...component,
                componentClassNameInCategory,
                importerComponent,
                importerComponentType
              };
            })
            // TODO: experimental
            .sort((a, b) => (getKey(b) < getKey(a) ? 0 : -1));
          return {
            all,
            filterd: all.slice(1),
            root: all[0],
            single: all.length == 1
          };
        })
        .sort((a, b) => (getKey(a.root) < getKey(b.root) ? -1 : 0));

      for (const group of globalNew.groups) {
        if (group.single) continue;
        const state = {
          fileName: group.root.fileName,
          options,
          ...group
        };
        const patterns = ['templates/src/components/*fileName*.compact.ts.hbs'];
        renderTemplate(patterns, options.destination, config)(state);
      }
    }

    if (isEmpty) {
      const patterns = [
        'templates/**',
        '!templates/src/components/*fileName*.ts.hbs',
        '!templates/src/components/*fileName*.compact.ts.hbs'
      ];
      renderTemplate(patterns, options.destination, config)(globalNew);
    }

    if (!isEmpty) {
      const patterns = ['templates/src/proxy*', 'templates/src/components/index*'];
      renderTemplate(patterns, options.destination, config)(globalNew);
    }
  };

  return { name, finish };
};
