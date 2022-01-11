import { Element, slots } from '@htmlplus/element';

@Element()
export class MyElement {
  loadedCallback() {
    console.log(123, slots(this));
  }
  render() {
    return (
      <>
        <h1>
          <slot />
        </h1>
        <h1>
          <slot name="a" />
        </h1>
      </>
    );
  }
}
