import glob from 'fast-glob';
import fs from 'fs';
import handlebars from 'handlebars';
import path from 'path';

export const renderTemplate = (source: string | Array<string>, destination: string, options?) => (context) => {
  const files: any = glob.sync(source, options);

  for (const file of files) {
    const from = path.resolve(options?.cwd || '', file);

    const to = path.join(
      destination,
      path
        .normalize(file)
        .split(path.sep)
        .slice(1)
        .map((section) => handlebars.compile(section)(context))
        .join(path.sep)
        .replace('_.', '.')
        .replace('.hbs', '')
    );

    const directory = path.dirname(to);

    const raw = fs.readFileSync(from, 'utf8');

    const template = handlebars.compile(raw)(context);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    fs.writeFileSync(to, template, 'utf8');
  }
};
