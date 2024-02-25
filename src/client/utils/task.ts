export interface QueueOptions {
  canStart?: () => boolean;
  canRun?: () => boolean;
  handler: () => void;
}

export const task = (options: QueueOptions) => {
  let running, promise!: Promise<boolean>;

  const run = () => {
    if (options.canStart && !options.canStart()) return Promise.resolve(false);

    if (!running) promise = enqueue();

    return promise;
  };

  const enqueue = async (): Promise<boolean> => {
    running = true;

    try {
      await promise;
    } catch (error) {
      Promise.reject(error);
    }

    // TODO: maybe is optional
    if (!running) return promise;

    try {
      if (options.canRun && !options.canRun()) return (running = false);

      options.handler();

      running = false;

      return true;
    } catch (error) {
      running = false;
      throw error;
    }
  };

  return run;
};
