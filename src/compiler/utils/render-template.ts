import glob from 'fast-glob';
import fs from 'fs';
import handlebars from 'handlebars';
import path from 'path';
import url from 'url';

export const renderTemplate = (source: string | Array<string>, destination: string, options?) => (context) => {
  // TODO
  if (options?.cwd && options.cwd.startsWith('file:///'))
    options.cwd = path.dirname(options?.cwd).replace('file:///', '');

  const files: any = glob.sync([source].flat(), {
    ...(options || {})
  });

  for (const file of files) {
    const fromPath = path.resolve(options?.cwd, file);
    const toPath = path.resolve(destination, file);
    const toDirectory = path.dirname(toPath);
    const toParsed = handlebars.compile(toPath.replace('.hbs', ''))(context);
    const raw = fs.readFileSync(fromPath, 'utf8');
    const content = handlebars.compile(raw)(context);
    if (!fs.existsSync(toDirectory)) {
      fs.mkdirSync(toDirectory, { recursive: true });
    }
    fs.writeFileSync(toParsed, content, 'utf8');
  }
};
