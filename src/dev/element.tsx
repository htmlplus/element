import { Element, slots, Method, Property } from '@htmlplus/element';

@Element()
export class MyElement {
  
  loadedCallback() {
    console.log(123, slots(this));
  }

  @Property()
  p1 = 'ppppp111111111'

  @Method()
  ab() {
    console.log('ab method', this.p1)
  }

  render() {
    return (
      <>
        <h1>
          <slot /> {this.p1}
        </h1>
        <h1>
          <slot name="a" />
        </h1>
      </>
    );
  }
}
