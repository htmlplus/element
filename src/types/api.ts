export interface Api {
  ready: boolean;
  host(): HTMLElement;
  request(states?): Promise<boolean>;
}
