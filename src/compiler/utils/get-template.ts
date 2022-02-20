import fs from 'fs';
import handlebars from 'handlebars';
import path from 'path';
import url from 'url';

export const getTemplate = (root: string, template: string) => {
  const dirname = path.dirname(url.fileURLToPath(root));
  const filePath = path.resolve(dirname, template);
  const content = fs.readFileSync(filePath, 'utf8');
  return handlebars.compile(content);
};
