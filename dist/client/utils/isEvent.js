export const isEvent = (input) => {
    return !!(input === null || input === void 0 ? void 0 : input.match(/on[A-Z]\w+/g));
};
