# Create Custom HTML Element

## Install
```bash
npm init @htmlplus/element
```

## First element

```tsx
import { Element } from '@htmlplus/element';

@Element('my-element')
export class MyElement {
  render() {
    return <h1>Hi Everybody</h1>
  }
}
```

```html
<my-element></my-element>
```

## Auto tag name

```tsx
import { Element } from '@htmlplus/element';

@Element()
export class MyElement {
  render() {
    return <h1>Hi Everybody</h1>
  }
}
```

```html
<my-element></my-element>
```

## Property decorator

Decorator Options:
- attribute: TODO
- reflect: TODO

```tsx
import { Element, Property } from '@htmlplus/element';

@Element()
export class MyGreeting {

  @Property()
  name?: string = 'Simon';

  render() {
    return <h1>Hi {this.name}</h1>
  }
}
```

```html
<my-greeting name="Jan" id="element"></my-greeting>

<script>
  const element = document.getElementById('element');
  console.log(element.name); // Jan
</script>
```

## Property decorator - reflect

```tsx
import { Element, Property } from '@htmlplus/element';

@Element()
export class MyButton {

  @Property({ reflect: true })
  disabled?: boolean = true;

  render() {
    return <button disabled={this.disabled}>
      <slot />
    </button>
  }
}
```

```html
<my-button>Button</my-button>

<style>
  my-button[disabled] {
    opacity: 0.5;
  }
</style>
```

## Event decorator

Decorator Options:
- name: A string custom event name to override the default.
- bubbles: A Boolean indicating whether the event bubbles up through the DOM or not. default is `false`.
- cancelable: A Boolean indicating whether the event is cancelable. default is `false`.
- composed: A Boolean value indicating whether or not the event can bubble across the boundary between the shadow DOM and the regular DOM. The default is false.

```tsx
import { Element, Event, EventEmitter } from '@htmlplus/element';

@Element()
export class MyButton {

  @Event()
  clicked!: EventEmitter;

  render() {
    return <button onClick={() => this.clicked()}>
      <slot />
    </button>
  }
}
```

```html
<my-button id="button">Button</my-button>

<script>
  document
    .getElementById('button')
    .addEventListener('clicked', () => alert('Clicked!'));
</script>
```

## Bind decorator

```tsx
import { Element, Bind } from '@htmlplus/element';

@Element()
export class MyButton {

  @Bind()
  onScroll(event) {
    console.log(event)
  }

  connectedCallback() {
    document.addEventListener('scroll', this.onScroll);
  }
}
```
## Method decorator

```tsx
import { Element, Method } from '@htmlplus/element';

@Element()
export class MyDialog {
  @Method()
  open() { }
}
```

```html
<my-dialog id="dialog"></my-dialog>

<script>
  document.getElementById('dialog').open();
</script>
```

## Watch decorator

```tsx
import { Element, Property, Watch } from '@htmlplus/element';

@Element()
export class MyElement {

  @Property()
  name?: string;

  @Watch('name')
  watcher(key, newValue, oldValue) { }
}
```

## Listen decorator

Decorator Options:
  - target: TODO
  - once: TODO
  - passive: TODO
  - signal: TODO
  - capture: TODO

```tsx
import { Element, Listen } from '@htmlplus/element';

@Element()
export class MyButton {
  @Listen('click')
  onClick(event) { }
}
```

## State decorator

```tsx
import { Element, Listen, State } from '@htmlplus/element';

@Element()
export class MySwitch {

  @State()
  active?: boolean;

  @Listen('click')
  onClick() {
    this.active = !this.active;
  }

  render() {
    return <button>
      {this.active ? 'On' : 'Off'}
    </button>;
  }
}
```

# Compiler

```js
import compiler from '@htmlplus/element/compiler';

const { start, next, finish } = compiler(
  ...plugins
);
```

# Compiler plugins

```js
import compiler, * as plugins from '@htmlplus/element/compiler';

const { start, next, finish } = compiler(
  plugins.read(),
  plugins.parse(),
  plugins.extract({
    prefix: 'plus',
  }),
  plugins.attach(),
  plugins.uhtml(),
  plugins.print(),
);

await start();

const { script } = await next('element.tsx');

await finish();
```