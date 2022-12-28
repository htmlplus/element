import { capitalCase, paramCase } from 'change-case';
import fs from 'fs-extra';
import glob from 'glob';
import path from 'path';

import { Context, Global, Plugin } from '../../types';
import { getInitializer, getTag, getTags, getTypeReference, hasTag, parseTag, print } from '../utils/index.js';

export const DOCUMENT_OPTIONS: Partial<DocumentOptions> = {};

export interface DocumentOptions {
  destination: string;
  transformer?: (context: Context, element: any) => any;
}

export const document = (options: DocumentOptions): Plugin => {
  const name = 'document';

  options = Object.assign({}, DOCUMENT_OPTIONS, options);

  const finish = (global: Global) => {
    const json = {
      components: [] as any
    };

    for (const context of global.contexts) {
      const deprecated = hasTag(context.class!, 'deprecated');

      const description = getTags(context.class!).find((tag) => !tag.key)?.value;

      const events = context.classEvents!.map((event) => {
        const cancelable = (() => {
          if (!event.decorators) return false;
          try {
            for (const decorator of event.decorators) {
              for (const argument of decorator.expression['arguments']) {
                for (const property of argument.properties) {
                  if (property.key.name != 'cancelable') continue;
                  if (property.value.type != 'BooleanLiteral') continue;
                  if (!property.value.value) continue;
                  return true;
                }
              }
            }
          } catch {}
          return false;
        })();

        const deprecated = hasTag(event, 'deprecated');

        const description = getTags(event).find((tag) => !tag.key)?.value;

        const detail = print(event.typeAnnotation?.['typeAnnotation']);

        const detailReference = getTypeReference(
          context.fileAST!,
          event.typeAnnotation?.['typeAnnotation'].typeParameters.params[0]
        );

        const experimental = hasTag(event, 'experimental');

        const model = hasTag(event, 'model');

        const name = event.key['name'];

        const tags = getTags(event);

        return {
          cancelable,
          deprecated,
          description,
          detail,
          detailReference,
          experimental,
          model,
          name,
          tags
        };
      });

      const experimental = hasTag(context.class!, 'experimental');

      const group = getTag(context.class!, 'group')?.value;

      const lastModified = glob
        .sync(path.join(context.directoryPath!, '**/*.*'))
        .map((file) => fs.statSync(file).mtime)
        .sort((a, b) => (a > b ? 1 : -1))
        .pop();

      const methods = context.classMethods!.map((method) => {
        const async = method.async;

        const description = getTags(method).find((tag) => !tag.key)?.value;

        const deprecated = hasTag(method, 'deprecated');

        const experimental = hasTag(method, 'experimental');

        const name = method.key['name'];

        // TODO
        const parameters = method.params.map((param) => ({
          description: getTags(method, 'param')
            .map((tag) => parseTag(tag, ' '))
            .find((tag) => tag.name == param['name'])?.description,
          required: !param['optional'],
          name: param['name'],
          type: print(param?.['typeAnnotation']?.typeAnnotation) || undefined,
          typeReference: getTypeReference(context.fileAST!, param?.['typeAnnotation']?.typeAnnotation)
        }));

        const returns = print(method.returnType?.['typeAnnotation']) || 'void';

        const returnsReference = getTypeReference(context.fileAST!, method.returnType?.['typeAnnotation']);

        const tags = getTags(method);

        const signature = [
          method.key['name'],
          '(',
          parameters
            .map((parameter) => {
              let string = '';
              string += parameter.name;
              string += parameter.required ? '' : '?';
              string += parameter.type ? ': ' : '';
              string += parameter.type ?? '';
              return string;
            })
            .join(', '),
          ')',
          ' => ',
          returns
        ].join('');

        return {
          async,
          description,
          deprecated,
          experimental,
          name,
          parameters,
          returns,
          returnsReference,
          tags,
          signature
        };
      });

      const parts = getTags(context.class!, 'part').map((tag) => parseTag(tag));

      const properties = context.classProperties!.map((property) => {
        const attribute = paramCase(property.key['name']);

        const deprecated = hasTag(property, 'deprecated');

        const description = getTags(property).find((tag) => !tag.key)?.value;

        const experimental = hasTag(property, 'experimental');

        // TODO
        const initializer = getInitializer(property.value!);

        const model = hasTag(property, 'model');

        const name = property.key['name'];

        // TODO
        const reflects = (() => {
          if (!property.decorators) return false;
          try {
            for (const decorator of property.decorators) {
              for (const argument of decorator.expression['arguments']) {
                for (const property of argument.properties) {
                  if (property.key.name != 'reflect') continue;
                  if (property.value.type != 'BooleanLiteral') continue;
                  if (!property.value.value) continue;
                  return true;
                }
              }
            }
          } catch {}
          return false;
        })();

        const required = !property.optional;

        const tags = getTags(property);

        const type = print(property.typeAnnotation?.['typeAnnotation']);

        const typeReference = getTypeReference(context.fileAST!, property.typeAnnotation?.['typeAnnotation']);

        return {
          attribute,
          deprecated,
          description,
          experimental,
          initializer,
          model,
          name,
          reflects,
          required,
          tags,
          type,
          typeReference
        };
      });

      const slots = getTags(context.class!, 'slot').map((tag) => parseTag(tag));

      // TODO
      const styles = (() => {
        if (!context.stylePath) return [];
        return fs
          .readFileSync(context.stylePath!, 'utf8')
          .split('@prop')
          .slice(1)
          .map((section) => {
            let [description, name] = section.split(/\n/);

            name = name.split(':').slice(0, -1).join(':').trim();

            description = description.trim();

            let [initializer] = context.styleParsed?.split(name).slice(1, 2) || [];

            if (initializer) initializer = initializer.split(/;|}/)[0].replace(':', '').trim();

            return {
              description,
              initializer,
              name
            };
          });
      })();

      const tags = getTags(context.class!);

      const title = capitalCase(context.componentKey!);

      const component = {
        events,
        group,
        deprecated,
        description,
        experimental,
        key: context.componentKey!,
        lastModified,
        methods,
        parts,
        properties,
        readmeContent: context.readmeContent,
        slots,
        styles,
        tags,
        title
      };

      const transformed = options.transformer?.(context, component) || component;

      json.components.push(transformed);
    }

    json.components = json.components.sort((a, b) => (a.title > b.title ? 1 : -1));

    const dirname = path.dirname(options.destination);

    fs.ensureDirSync(dirname);

    fs.writeJSONSync(options.destination, json, { encoding: 'utf8', spaces: 2 });
  };

  return { name, finish };
};
