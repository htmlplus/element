import cpy from 'cpy';
import fs from 'fs';

cpy(['package-lock.json', 'README.md'], 'dist');

const raw = fs.readFileSync('package.json', 'utf8');
const parsed = JSON.parse(raw);
delete parsed.scripts;
const stringified = JSON.stringify(parsed, null, 2);
fs.writeFileSync('dist/package.json', stringified);
