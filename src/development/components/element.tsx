import { Attributes, Element, Property, Watch } from '@htmlplus/element';

@Element()
export class MyElement {

  @Property({ reflect: true })
  value: number = 9;

  @Property({ reflect: true })
  maxSize: number;

  @Property({ reflect: true })
  size: number = 98;

  @Property()
  minSize: number = 4;

  @Property()
  min: number;

  @Attributes()
  get attributes() {
    return {
      onClick: () => {
        this.value++
        this.maxSize = this.value + 1;
        this.maxSize = this.value + 2;
        this.maxSize = this.value + 3;
        console.log('onClick')
      }
    };
  }

  @Watch(['value'])
  watcher(...args) {
    console.log("@Watch(['value'])", args);
  }

  render() {
    console.log('renderd in the component');
    return (
      <div>
        <slot /> {this.value}
      </div>
    );
  }
}
