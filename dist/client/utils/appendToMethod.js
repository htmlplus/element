export const appendToMethod = (target, key, handler) => {
    // Gets the previous function
    const previous = target[key];
    // Creates new function
    function next(...parameters) {
        // Calls the previous
        const result = previous?.bind(this)(...parameters);
        // Calls the appended
        handler.bind(this)(...parameters);
        // Returns the result
        return result;
    }
    // Replaces the next with the previous one
    target[key] = next;
};
