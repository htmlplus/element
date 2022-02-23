import glob from 'fast-glob';
import fs from 'fs';
import handlebars from 'handlebars';
import path from 'path';
import url from 'url';

export const renderTemplate = (source: string | Array<string>, destination: string, options?) => (context) => {
  // TODO
  if (options?.cwd && options.cwd.startsWith('file:///'))
    options.cwd = path.dirname(options?.cwd).replace('file:///', '');

  const addresses: any = glob.sync([source].flat(), {
    ...(options || {})
  });

  for (const address of addresses) {
    const addressNormalized = path.normalize(address);
    const addressResolved = path.resolve(options?.cwd, addressNormalized);
    const addressParsed = path
      .normalize(addressNormalized)
      .split(path.sep)
      .map((section) => {
        const parsed = section.replace('_.', '.').replace('.hbs', '').replace('[', '{{').replace(']', '}}');
        return handlebars.compile(parsed)(context);
      })
      .slice(1)
      .join(path.sep);

    const toPath = path.resolve(destination, addressParsed);
    const toDirectory = path.dirname(toPath);

    const templateRaw = fs.readFileSync(addressResolved, 'utf8');
    const templateParsed = handlebars.compile(templateRaw)(context);

    if (!fs.existsSync(toDirectory)) {
      fs.mkdirSync(toDirectory, { recursive: true });
    }

    fs.writeFileSync(toPath, templateParsed, 'utf8');
  }
};
