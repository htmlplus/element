import { PropertyOptions } from './property-options.js';

export interface Api {
  ready: boolean;
  host: () => HTMLElement;
  property: (name: string, value: any, options?: PropertyOptions) => void;
  state: (name: string, value: any) => void;
}
