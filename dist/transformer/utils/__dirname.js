import { dirname } from 'path';
import { fileURLToPath } from 'url';
export const __dirname = (url) => {
    return dirname(fileURLToPath(url));
};
