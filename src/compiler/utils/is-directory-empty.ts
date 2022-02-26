import fs from 'fs';

export const isDirectoryEmpty = async (directory: string) => {
  try {
    const files = await fs.readdirSync(directory);
    return !files.length;
  } catch {
    return true;
  }
};
