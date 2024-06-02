export const isEvent = (input) => {
    return !!input?.match(/on[A-Z]\w+/g);
};
