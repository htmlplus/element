import glob from 'fast-glob';
import fs from 'fs-extra';
import handlebars from 'handlebars';
import path from 'path';
export const renderTemplate = (source, destination, options) => (context) => {
    const files = glob.sync(source, options);
    for (const file of files) {
        // TODO
        const from = path.resolve((options === null || options === void 0 ? void 0 : options.cwd) || '', file);
        // TODO
        const to = path.join(destination, path
            .normalize(file)
            .split(path.sep)
            .slice(1)
            .map((section) => handlebars.compile(section)(context))
            .join(path.sep)
            .replace('_.', '.')
            .replace('.hbs', ''));
        const directory = path.dirname(to);
        const raw = fs.readFileSync(from, 'utf8');
        const template = handlebars.compile(raw)(context);
        fs.ensureDirSync(directory);
        fs.writeFileSync(to, template, 'utf8');
    }
};
