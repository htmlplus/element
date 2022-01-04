export const on = (
  target: Window | Document | Element,
  event: string,
  handler: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
) => {
  target.addEventListener(event, handler, options);
};

export const off = (
  target: Window | Document | Element,
  event: string,
  handler: EventListenerOrEventListenerObject,
  options?: boolean | EventListenerOptions
) => {
  target.removeEventListener(event, handler, options);
};
