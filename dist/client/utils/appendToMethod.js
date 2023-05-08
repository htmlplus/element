export const appendToMethod = (target, propertyKey, handler) => {
    // Gets the previous function
    const previous = target[propertyKey];
    // Creates new function
    function next(...parameters) {
        // Calls the previous
        const result = previous === null || previous === void 0 ? void 0 : previous.bind(this)(...parameters);
        // Calls the appended
        handler.bind(this)(...parameters);
        // Returns the result
        return result;
    }
    // Replaces the next with the previous one
    target[propertyKey] = next;
};
