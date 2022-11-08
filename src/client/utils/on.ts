export const on = (
  target: Window | Document | Element,
  type: string,
  handler: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
): void => {
  target.addEventListener(type, handler, options);
};
