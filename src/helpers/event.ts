export const on = (target: Element, event: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
    target.addEventListener(event, handler, options);
}

export const off = (target: Element, event: string, handler: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => {
    target.removeEventListener(event, handler, options);
}