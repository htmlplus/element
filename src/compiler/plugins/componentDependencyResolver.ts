import t from '@babel/types';

import { Context, Global } from '../../types/index.js';
import { visitor } from '../utils/index.js';

export const componentDependencyResolver = () => {
  const name = 'comoponent dependency resolver';

  const next = (context: Context, global: Global) => {
    if (!context.dependenciesUnresolved) {
      visitor(context.fileAST!, {
        JSXOpeningElement(path) {
          const name = path.node.name.name;
          if (!name.includes('-')) return;
          const find = context.dependenciesUnresolved?.includes(name);
          if (find) return;
          context.dependenciesUnresolved ??= [];
          context.dependenciesUnresolved?.push(name);
        }
      });
    }
    for (const current of global.contexts) {
      if (!current.dependenciesUnresolved?.length) continue;
      const dependencies = global.contexts.filter((context) =>
        current.dependenciesUnresolved?.includes(context.componentTag!)
      );
      for (const dependency of dependencies) {
        if (current.dependencies?.some((item) => item.componentTag == dependency.componentTag)) continue;
        current.dependencies ??= [];
        current.dependencies.push(dependency);
        current.dependenciesUnresolved = current.dependenciesUnresolved?.filter(
          (current) => current != dependency.componentTag
        );
        // TODO
        // current.fileAST!.program.body.unshift(t.importDeclaration([], t.stringLiteral(dependency.filePath!)));
      }
    }
  };

  return {
    name,
    next
  };
};
