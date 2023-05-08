import fs from 'fs-extra';
export const isDirectoryEmpty = (directory) => {
    try {
        const files = fs.readdirSync(directory);
        return !files.length;
    }
    catch (_a) {
        return true;
    }
};
