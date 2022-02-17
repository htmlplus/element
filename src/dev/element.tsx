import { Attributes, Bind, Element, Event, EventEmitter, Listen, Method, Property, State, Watch } from '@htmlplus/element';

@Element()
export class MyElement {
  @Property()
  name?: string = 'Simon';

  @Event()
  clicked!: EventEmitter;

  @State()
  active?: boolean = false;

  $indicator!: HTMLElement

  @Attributes()
  get attributes() {
    return {
      'role': 'TODO'
    }
  }


  @Method()
  open() {
    // console.log('@Method', this.name);
  }

  @Watch('name')
  // @Watch('*')
  watcher(key, newValue, oldValue) {
    console.log('@Watch', key, newValue, oldValue);
  }

  @Listen('scroll', { target: 'window' })
  onClick(event) {
    console.log('@Listen', event, this);
    this.active = !this.active;
  }

  @Bind()
  onScroll(event) {
    console.log(123, event, this);
  }

  handleClick() {
    // this.clicked()
    // console.log('handleClick', this.name)
    this.active = !this.active;
    console.log('update => active', this.active);
    this.name = Date.now().toString();
    console.log('update => name', this.name);
  }

  connectedCallback() {
    document.addEventListener('scroll', this.onScroll);
  }

  disconnectedCallback() {
    document.removeEventListener('scroll', this.onScroll);
  }

  render() {
    return (
      <>
        <button onClick={() => this.handleClick()} ref={this.$indicator}>
          {this.active ? 'On' : 'Off'} {this.name}
        </button>
      </>
    );
  }
}
