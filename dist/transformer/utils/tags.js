export const getTag = (node, key) => {
    return getTags(node, key).pop();
};
export const getTags = (node, filter) => {
    var _a, _b, _c;
    const tags = [];
    // TODO
    const comments = node['_leadingComments'] || node.leadingComments;
    const lines = (_c = (_b = (_a = comments === null || comments === void 0 ? void 0 : comments.map((comment) => {
        const { type, value } = comment;
        if (type == 'CommentLine')
            return value;
        return value.replace(/\r\n/g, '\n').split('\n');
    })) === null || _a === void 0 ? void 0 : _a.flat()) === null || _b === void 0 ? void 0 : _b.filter((line) => line.trim().replace(/\*/g, ''))) === null || _c === void 0 ? void 0 : _c.map((line) => line.replace(/^( +)?(\*+)?( +)?/, ''));
    for (const line of lines || []) {
        const has = !!tags.length;
        const isTag = line.startsWith('@');
        if (isTag) {
            const [key, ...values] = line.split(' ');
            tags.push({
                key: key.slice(1).trim(),
                value: values.join(' ').trimStart()
            });
            continue;
        }
        if (!has)
            tags.push({ key: '', value: '' });
        tags[tags.length - 1].value += line;
    }
    return tags.filter((tag) => !filter || filter === tag.key);
};
export const hasTag = (node, name) => {
    return getTags(node).some((tag) => tag.key === name);
};
export const parseTag = (tag, spliter = ' - ') => {
    var _a, _b;
    const sections = ((_a = tag.value) === null || _a === void 0 ? void 0 : _a.split(spliter)) || [];
    const name = (_b = sections[0]) === null || _b === void 0 ? void 0 : _b.trim();
    const description = sections.slice(1).join(spliter).trim();
    return {
        name,
        description
    };
};
