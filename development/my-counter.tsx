import { Element, State } from '@htmlplus/element';

@Element()
export class MyCounter {
  @State()
  value: number = 0;

  render() {
    return <button type="button" onClick={() => this.value++}>Count is {this.value}</button>;
  }
}
