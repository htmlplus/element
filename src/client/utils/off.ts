export const off = (
  target: Window | Document | Element,
  type: string,
  handler: EventListenerOrEventListenerObject,
  options?: boolean | EventListenerOptions
): void => {
  target.removeEventListener(type, handler, options);
};
