import * as CONSTANTS from '../../constants/index.js';
import { call } from './call.js';
import { getStyles } from './getStyles.js';
import { shadowRoot } from './shadowRoot.js';
import { task } from './task.js';
import { html, render } from './uhtml.js';
/**
 * Updates the DOM with a scheduled task.
 * @param target The element instance.
 * @param name Property/State name.
 * @param previous The previous value of Property/State.
 * @param callback Invoked when the rendering phase is completed.
 */
export const request = (target, name, previous, callback) => {
    // Creates/Gets a stacks.
    const stacks = (target[CONSTANTS.API_STACKS] ||= new Map());
    // Creates/Updates a stack.
    const stack = stacks.get(name) || { callbacks: [], previous };
    // Adds the callback to the stack, if exists.
    callback && stack.callbacks.push(callback);
    // Stores the stack.
    stacks.set(name, stack);
    // Defines a handler.
    const handler = () => {
        // Skips the rendering phase if DOM isn't ready.
        if (!target[CONSTANTS.API_CONNECTED])
            return;
        // Calculates the states to pass into lifecycles' callbacks.
        const states = new Map(Array.from(stacks)
            .filter((stack) => stack[0])
            .map((stack) => [stack[0], stack[1].previous]));
        // Calls the lifecycle's callback before the rendering phase.
        call(target, CONSTANTS.LIFECYCLE_UPDATE, states);
        // Calculates the template.
        const template = () => {
            // Calculates the markup.
            const markup = call(target, CONSTANTS.METHOD_RENDER);
            // Calculates the styles.
            const styles = getStyles(target);
            // Returns the markup if styles don't exist.
            if (!styles)
                return markup;
            // Returns the markup and styles together.
            return html `<style>${styles}</style>${markup}`;
        };
        // Renders template to the DOM.
        render(shadowRoot(target), template);
        // Invokes requests' callback.
        stacks.forEach((state) => {
            state.callbacks.forEach((callback, index, callbacks) => {
                callback(callbacks.length - 1 != index);
            });
        });
        // Calls the lifecycle's callback after the rendering phase.
        call(target, CONSTANTS.LIFECYCLE_UPDATED, states);
        // Clears stacks.
        stacks.clear();
        // TODO: releated to the @Watch decorator.
        target[CONSTANTS.API_RENDER_COMPLETED] = true;
    };
    // Creates/Gets a micro task function.
    target[CONSTANTS.API_REQUEST] ||= task({ handler });
    // Calls the micro task.
    call(target, CONSTANTS.API_REQUEST);
};
