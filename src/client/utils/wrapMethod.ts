export const wrapMethod = (
  mode: 'before' | 'after',
  target: Object,
  key: PropertyKey,
  handler: (this, ...args: any[]) => void
): void => {
  // Gets the original function
  const original = target[key];

  // Validate target property
  if (original && typeof original !== 'function') {
    throw new TypeError(`Property ${String(key)} is not a function`);
  }

  // Creates new function
  function wrapped(this: any, ...args: any[]) {
    // Calls the handler before the original
    if (mode == 'before') {
      handler.apply(this, args);
    }

    // Calls the original
    const result = original?.apply(this, args);

    // Calls the handler after the original
    if (mode == 'after') {
      handler.apply(this, args);
    }

    // Returns the result
    return result;
  }

  // Replaces the wrapped with the original one
  target[key] = wrapped;
};
