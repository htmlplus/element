import { Bind, Element, Event, EventEmitter, Listen, Method, Property, State, Watch } from '@htmlplus/element';

@Element()
export class MyElement {
  @Property()
  name?: string = 'Simon';

  @Event()
  clicked!: EventEmitter;

  @State()
  active?: boolean = false;

  @Method()
  open() {
    console.log('@Method', this.name);
  }

  @Watch('name')
  watcher(key, newValue, oldValue) {
    console.log('@Watch', key, newValue, oldValue);
  }

  @Listen('scroll', { target: 'window' })
  onClick(event) {
    console.log('@Listen', event);
    this.active = !this.active;
  }

  @Bind()
  onScroll(event) {
    console.log(event);
  }

  handleClick() {
    // this.clicked()
    // console.log('handleClick', this.name)
    this.active = !this.active;
    console.log('active', this.active);
    this.name = Date.now().toString();
    console.log('name', this.name);
  }

  connectedCallback() {
    // document.addEventListener('scroll', this.onScroll);
  }

  disconnectedCallback() {
    // document.removeEventListener('scroll', this.onScroll);
  }

  render() {
    return (
      <>
        <button onClick={() => this.handleClick()}>
          {this.active ? 'On' : 'Off'} {this.name}
        </button>
      </>
    );
  }
}
