export const appendToMethod = (
  target: Object,
  key: PropertyKey,
  handler: (this, ...parameters: Array<any>) => void
): void => {
  // Gets the previous function
  const previous = target[key];

  // Creates new function
  function next(this, ...parameters) {
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
