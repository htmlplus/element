export interface QueueOptions {
  canStart?: (states, state) => boolean;
  canRun?: (states) => boolean;
  run: (states) => void;
}

export const task = (options: QueueOptions) => {
  let states, isPending, updatePromise!: Promise<boolean>;

  const run = (state?) => {
    const newStates = Object.assign({}, states, state);

    if (options.canStart && !options.canStart(newStates, state)) return Promise.resolve(false);

    states = newStates;

    if (!isPending) updatePromise = enqueue();

    return updatePromise;
  };

  const enqueue = async (): Promise<boolean> => {
    isPending = true;

    try {
      await updatePromise;
    } catch (error) {
      Promise.reject(error);
    }

    // TODO: maybe is optional
    if (!isPending) return updatePromise;

    try {
      if (options.canRun && !options.canRun(states)) return (isPending = false);

      options.run(states);

      states = undefined;

      isPending = false;

      return true;
    } catch (error) {
      isPending = false;
      throw error;
    }
  };

  return run;
};
