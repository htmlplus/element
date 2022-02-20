import fs from 'fs';
import glob from 'glob';
import handlebars from 'handlebars';
import path from 'path';
import url from 'url';

export const loadTemplate = (root, pattern: string) => {
  const dirname = path.dirname(url.fileURLToPath(root));
  return glob.sync(pattern, { cwd: dirname }).reduce((result, file) => {
    const filePath = path.resolve(dirname, file);
    const content = fs.readFileSync(filePath, 'utf8');
    result[file] = handlebars.compile(content);
    return result;
  }, {});
};
