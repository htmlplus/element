import { PlusElement } from '../../types';
/**
 * Updates the DOM with a scheduled task.
 * @param target The component instance.
 * @param name Property/State name.
 * @param previous The previous value of Property/State.
 * @param callback Invoked when the rendering phase is completed.
 */
export declare const request: (target: PlusElement, name?: string, previous?: any, callback?: ((skipped: boolean) => void) | undefined) => void;
