export interface EventOptions {
    /**
     * A string custom event name to override the default.
     */
    name?: string;
    /**
     * A Boolean indicating whether the event bubbles up through the DOM or not. default is `false`.
     */
    bubbles?: boolean;
    /**
     * A Boolean indicating whether the event is cancelable. default is `false`.
     */
    cancelable?: boolean;
    /**
     * A Boolean value indicating whether or not the event can bubble across the boundary between the shadow DOM and the regular DOM. The default is false.
     */
    composed?: boolean;
}