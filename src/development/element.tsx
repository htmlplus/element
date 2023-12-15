import { Element, Property } from '@htmlplus/element';

@Element()
export class MyElement {
  @Property()
  value: any;
  
  render() {
    return <div><slot /></div>;
  }
}
