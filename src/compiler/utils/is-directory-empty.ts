import fs from 'fs';

export const isDirectoryEmpty = (directory: string) => {
  try {
    const files = fs.readdirSync(directory);
    return !files.length;
  } catch {
    return true;
  }
};
