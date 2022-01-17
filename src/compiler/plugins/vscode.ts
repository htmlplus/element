import { paramCase } from 'change-case';
import fs from 'fs';
import path from 'path';

import { Context } from '../../types/index.js';
import { getTags, getType, printType } from '../utils/index.js';

export interface VscodeOptions {
  dist: string;
  prefix: string;
}

export const vscode = (options: VscodeOptions) => {
  const name = 'vscode';

  const start = (global) => {
    global.vscode = {
      version: 1.1,
      tags: []
    };
  };

  const next = (context: Context, global) => {
    const readme = (() => {
      try {
        const source = path.resolve(context.directoryPath || '', `${context.fileName}.md`);

        return fs.readFileSync(source, 'utf8');
      } catch {}
    })();

    const description = (() => {
      const content = readme || '';

      if (!content.startsWith('# ')) return '';

      const sections = content.split('\n');

      for (let i = 1; i < sections.length; i++) {
        const section = sections[i].trim();

        if (!section) continue;

        return section;
      }

      return '';
    })();

    const properties = (context.classProperties || []).map((property) => {
      const name = paramCase(property.key['name']);

      const description = getTags(property).find((tag) => !tag.key)?.value;

      const attribute: any = {
        name,
        description
      };

      // TODO
      let { members = [] } = (() => {
        const ast = getType(context.fileAST as any, (property.typeAnnotation || {})['typeAnnotation'], {
          directory: context.directoryPath
        });

        return printType(ast);
      })();

      // TODO
      members = members.filter((member) => member.key !== member.type).map((member) => ({ name: member.key }));

      if (members.length) attribute.values = members;

      return attribute;
    });

    global.vscode.tags.push({
      name: context.componentKey,
      description: {
        kind: 'markdown',
        value: description
      },
      attributes: properties,
      references: [
        {
          name: 'Source code',
          url: `https://github.com/htmlplus/core/tree/main/src/components/${context.directoryName}/${context.fileName}.tsx`
        }
      ]
    });
  };

  const finish = (global) => {
    global.vscode.tags = global.vscode.tags.sort((a, b) => (a.name > b.name ? 1 : -1));

    // TODO
    // fs.ensureDirSync(path.dirname(options.dist));

    // TODO
    // fs.writeJSONSync(options.dist, global.vscode, { replacer: null, spaces: 2 });
  };

  return {
    name,
    start,
    next,
    finish
  };
};
