export const extractFromComment = (node, whitelist) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const normalized = [];
    const result = {
        description: ''
    };
    const lines = (_d = (_c = (_b = (_a = node.leadingComments) === null || _a === void 0 ? void 0 : _a.map((comment) => {
        if (comment.type == 'CommentLine')
            return comment.value;
        return comment.value.split('\n');
    })) === null || _b === void 0 ? void 0 : _b.flat()) === null || _c === void 0 ? void 0 : _c.map((line) => line.trim().replace(/^\*/, '').trim())) === null || _d === void 0 ? void 0 : _d.filter((line) => line.trim());
    for (const line of lines || []) {
        if (line.startsWith('@')) {
            normalized.push(line);
            continue;
        }
        if (!normalized.length)
            normalized.push('');
        normalized[normalized.length - 1] += ' ' + line;
    }
    for (const line of normalized) {
        if (!line.startsWith('@')) {
            result.description = line.trim();
            continue;
        }
        const regex = /@(\w+)(?:\s*({\w+})\s*)?(?:\s*([-a-zA-Z\s]+)\s*-\s*)?(.*)/;
        const groups = regex.exec(line);
        if (!groups)
            continue;
        const tag = (_e = groups[1]) === null || _e === void 0 ? void 0 : _e.trim();
        const type = (_f = groups[2]) === null || _f === void 0 ? void 0 : _f.trim().slice(1, -1);
        const name = (_g = groups[3]) === null || _g === void 0 ? void 0 : _g.trim();
        const description = (_h = groups[4]) === null || _h === void 0 ? void 0 : _h.trim();
        if (name && description) {
            const key = tag + 's';
            if (whitelist && !whitelist.includes(key))
                continue;
            (result[key] || (result[key] = [])).push({ name, type, description });
        }
        else {
            const key = tag;
            if (whitelist && !whitelist.includes(key))
                continue;
            result[key] = description || true;
        }
    }
    return result;
};
