export const getInitializer = (node) => {
    return node?.extra?.raw || node?.['value'];
};
