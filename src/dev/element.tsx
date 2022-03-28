import { Attributes, Bind, Element, Event, EventEmitter, Listen, Method, Property, State, Watch } from '@htmlplus/element';

@Element()
export class MyElement {
  
  @Property({ reflect: true })
  property?: string = "Initial";

  @Event()
  plusClicked!: EventEmitter;  
  
  $element!: HTMLElement

  @Attributes()
  get attributes() {
    return {
      'role': 'TODO'
    }
  }

  @Method()
  method() {
    console.log('@Method', this.property);
  }

  @Watch('property')
  watcher(key, newValue, oldValue) {
    console.log('@Watch', key, newValue, oldValue);
  }

  @Listen('dblclick', { target: 'window' })
  onDblclick(event) {
    console.log('@Listen', 'dblclick', event);
  }

  @Bind()
  onClick(event) {
    console.log('@Bind', 'click', event);
  }

  @Bind()
  onContextMenu(event) {
    console.log('@Bind', 'contextmenu', event);
  }

  connectedCallback() {
    document.addEventListener('contextmenu', this.onContextMenu);
  }

  disconnectedCallback() {
    document.removeEventListener('contextmenu', this.onContextMenu);
  }

  render() {
    return (
      <div ref={this.$element} onClick={this.onClick}>
        {this.property}
      </div>
    )
  }
}
