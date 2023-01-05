import { paramCase } from 'change-case';
import fs from 'fs-extra';
import path from 'path';

import { Context, Global, Plugin } from '../../types';
import { getInitializer, getTags, getType, hasTag, parseTag, print } from '../utils/index.js';

export const WEB_TYPES_OPTIONS: Partial<WebTypesOptions> = {};

export interface WebTypesOptions {
  destination: string;
  packageName: string;
  packageVersion: string;
  reference?: (context: Context) => string;
  transformer?: (context: Context, component: any) => any;
}

export const webTypes = (options: WebTypesOptions): Plugin => {
  const name = 'webTypes';

  options = Object.assign({}, WEB_TYPES_OPTIONS, options);

  const finish = (global: Global) => {
    const contexts = global.contexts.sort((a, b) => {
      return a.componentTag!.toUpperCase() > b.componentTag!.toUpperCase() ? -1 : +1;
    });

    const json = {
      '$schema': 'http://json.schemastore.org/web-types',
      'name': options.packageName,
      'version': options.packageVersion,
      'description-markup': 'markdown',
      'framework-config': {
        'enable-when': {
          'node-packages': [options.packageName]
        }
      },
      'contributions': {
        html: {
          elements: [] as any[]
        }
      }
    };

    const common = (member) => ({
      name: member.key['name'],
      description: getTags(member).find((tag) => !tag.key)?.value,
      deprecated: hasTag(member, 'deprecated'),
      experimental: hasTag(member, 'experimental')
    });

    for (const context of contexts) {
      const attributes = context.classProperties?.map((property) =>
        Object.assign(common(property), {
          name: paramCase(property.key['name']),
          value: {
            // kind: TODO
            type: print(
              getType(context.fileAST!, property.typeAnnotation?.['typeAnnotation'], {
                directory: context.directoryPath
              })
            )
            // required: TODO
            // default: TODO
          },
          default: getInitializer(property.value!)
        })
      );

      const description = getTags(context.class!).find((tag) => !tag.key)?.value;

      const events = context.classEvents?.map((event) =>
        Object.assign(common(event), {
          name: paramCase(event.key['name']) // TODO
          // 'value': TODO
        })
      );

      const methods = context.classMethods?.map((method) =>
        Object.assign(common(method), {
          // 'value': TODO
        })
      );

      const properties = context.classProperties?.map((property) =>
        Object.assign(common(property), {
          // 'value': TODO
          default: getInitializer(property.value!)
        })
      );

      const slots = getTags(context.class!, 'slot').map((tag) => {
        const { description, name } = parseTag(tag);
        return {
          name,
          description
        };
      });

      const component = {
        'name': context.componentTag,
        'description': description,
        'doc-url': options.reference?.(context),
        'deprecated': hasTag(context.class!, 'deprecated'),
        'experimental': hasTag(context.class!, 'experimental'),
        'js': {
          events,
          properties: ([] as any).concat(properties, methods)
        },
        attributes,
        slots
      };

      const transformed = options.transformer?.(context, component) || component;

      json.contributions.html.elements.push(transformed);
    }

    const dirname = path.dirname(options.destination);

    fs.ensureDirSync(dirname);

    fs.writeJSONSync(options.destination, json, { encoding: 'utf8', spaces: 2 });
  };

  return { name, finish };
};
