import { dirname } from 'path';
import { fileURLToPath } from 'url';

export const __dirname = (url: string | URL) => {
  return dirname(fileURLToPath(url));
};
