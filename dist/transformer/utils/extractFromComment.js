export const extractFromComment = (node, whitelist) => {
    const normalized = [];
    const result = {
        description: ''
    };
    const lines = node.leadingComments
        ?.map((comment) => {
        if (comment.type == 'CommentLine')
            return comment.value;
        return comment.value.split('\n');
    })
        ?.flat()
        ?.map((line) => line.trim().replace(/^\*/, '').trim())
        ?.filter((line) => line.trim());
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
        const tag = groups[1]?.trim();
        const type = groups[2]?.trim().slice(1, -1);
        const name = groups[3]?.trim();
        const description = groups[4]?.trim();
        if (name && description) {
            const key = tag + 's';
            if (whitelist && !whitelist.includes(key))
                continue;
            (result[key] ||= []).push({ name, type, description });
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
