/**
 * Holds all details wrappers needed to render the content further on.
 * @constructor
 * @param {string} type The hole type, either `html` or `svg`.
 * @param {string[]} template The template literals used to the define the content.
 * @param {Array} values Zero, one, or more interpolated values to render.
 */
export class Hole {
    constructor(type: any, template: any, values: any);
    type: any;
    template: any;
    values: any;
}
export const html: ((template: any, ...values: any[]) => Hole) & {
    for(ref: any, id: any): any;
    node: (template: any, ...values: any[]) => any;
};
export function render(where: any, what: any): any;
export const svg: ((template: any, ...values: any[]) => Hole) & {
    for(ref: any, id: any): any;
    node: (template: any, ...values: any[]) => any;
};
