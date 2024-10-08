import { kebabCase } from 'change-case';
import fs from 'fs-extra';
import path from 'path';

import {
  TransformerPlugin,
  TransformerPluginContext,
  TransformerPluginGlobal
} from '../transformer.types.js';
import { extractAttribute, extractFromComment, getType, print } from '../utils/index.js';

export const VISUAL_STUDIO_CODE_OPTIONS: Partial<VisualStudioCodeOptions> = {
  destination: path.join('dist', 'visual-studio-code.json')
};

export interface VisualStudioCodeOptions {
  destination?: string;
  reference?: (context: TransformerPluginContext) => string;
  transformer?: (context: TransformerPluginContext, element: any) => any;
}

export const visualStudioCode = (options?: VisualStudioCodeOptions): TransformerPlugin => {
  const name = 'visualStudioCode';

  options = Object.assign({}, VISUAL_STUDIO_CODE_OPTIONS, options);

  const finish = (global: TransformerPluginGlobal) => {
    const contexts = global.contexts.sort((a, b) => {
      return a.elementKey!.toUpperCase() > b.elementKey!.toUpperCase() ? +1 : -1;
    });

    const json = {
      $schema: 'TODO',
      version: 1.1,
      tags: [] as any[]
    };

    for (const context of contexts) {
      const tag = Object.assign(
        {
          name: context.elementKey!,
          attributes: [] as any,
          references: [
            {
              name: 'Source code',
              url: options!.reference?.(context)
            }
          ]
        },
        extractFromComment(context.class!, ['description'])
      );

      for (const property of context.classProperties || []) {
        const attribute = Object.assign(
          {
            name: extractAttribute(property) || kebabCase(property.key['name']),
            values: [] as any
          },
          extractFromComment(property, ['description'])
        );

        const type = print(
          getType(
            context.directoryPath!,
            context.fileAST!,
            property.typeAnnotation?.['typeAnnotation']
          )
        );

        const sections = type.split('|');

        for (const section of sections) {
          const trimmed = section.trim();

          if (!trimmed) continue;

          const isBoolean = /bool|boolean|Boolean/.test(trimmed);

          const isNumber = !isNaN(trimmed as any);

          const isString = /^("|'|`)/.test(trimmed);

          if (isBoolean) {
            attribute.values.push(
              {
                name: 'false'
              },
              {
                name: 'true'
              }
            );
          } else if (isNumber) {
            attribute.values.push({
              name: trimmed
            });
          } else if (isString) {
            attribute.values.push({
              name: trimmed.slice(1, -1)
            });
          }
        }

        tag.attributes.push(attribute);
      }

      const transformed = options!.transformer?.(context, tag) || tag;

      json.tags.push(transformed);
    }

    const dirname = path.dirname(options!.destination!);

    fs.ensureDirSync(dirname);

    fs.writeJSONSync(options!.destination!, json, { encoding: 'utf8', spaces: 2 });
  };

  return { name, finish };
};
