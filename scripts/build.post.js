import cpy from 'cpy';

await cpy(
    [
        'src/**/*.hbs',
        'package.json',
        'package-lock.json',
        'README.md'
    ], 
    'dist'
);