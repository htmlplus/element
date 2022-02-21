import fs from 'fs';
import handlebars from 'handlebars';
import path from 'path';
import url from 'url';

export const copyTemplate = (root: string, template: string) => {
  const dirname = path.dirname(url.fileURLToPath(root));
  const filePath = path.resolve(dirname, template);
  const content = fs.readFileSync(filePath, 'utf8');
  return handlebars.compile(content);
};

// fs.copyFileSync('templates/proxy.ts.hbs', options.dist + 'proxy.ts');
// const a = copyTemplate(import.meta.url, 'templates/**/*')(context);
// if (!fs.existsSync(path.resolve(options.dist, `src`))) {
//   fs.mkdirSync(path.resolve(options.dist, `src`), { recursive: true });
// }
// fs.writeFileSync(path.resolve(options.dist, `src/${context.fileName}.ts`), a, 'utf8');
