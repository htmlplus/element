import glob from 'fast-glob';
import fs from 'fs';
import handlebars from 'handlebars';
import path from 'path';
import url from 'url';

export const renderTemplate = (source: string | Array<string>, destination: string, options?) => (context) => {
  const files: any = glob.sync([source].flat(), {
    ...(options || {}),
    // TODO
    cwd: path.dirname(options?.cwd).replace('file:///', '')
  });
  for (const file of files) {
    debugger;
    const filePath = path.resolve(path.dirname(options?.cwd).replace('file:///', ''), file);
    const content = fs.readFileSync(filePath, 'utf8');
    const t = handlebars.compile(content)(context);
    if (!fs.existsSync(path.dirname(path.resolve(destination, file)))) {
      fs.mkdirSync(path.dirname(path.resolve(destination, file)), { recursive: true });
    }
    fs.writeFileSync(path.resolve(destination, file).replace('.hbs', ''), t, 'utf8');
  }
};
