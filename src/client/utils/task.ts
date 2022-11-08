export interface QueueOptions {
  canStart?: () => boolean;
  canRun?: () => boolean;
  run: () => void;
}

export const task = (options: QueueOptions) => {
  let isPending, updatePromise!: Promise<boolean>;

  const run = () => {
    if (options.canStart && !options.canStart()) return Promise.resolve(false);

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
      if (options.canRun && !options.canRun()) return (isPending = false);

      options.run();

      isPending = false;

      return true;
    } catch (error) {
      isPending = false;
      throw error;
    }
  };

  return run;
};
