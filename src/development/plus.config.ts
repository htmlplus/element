import { customElement, extract, parse, read, style, validate } from '../compiler/index.js';

export default [read(), parse(), validate(), extract(), style(), customElement({ typings: false })];
