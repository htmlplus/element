# Create Custom HTML Element

## Table of content
- [Install](#install)
- [Start](#start)
- [First element](#Firstelement)
- [Decorators](#decorators)
  - [Element](#element)
  - [Property](#property)
  - [Event](#event)
  - [Method](#method)
  - [Watch](#watch)
  - [Listen](#listen)
  - [State](#state)
  - [Bind](#bind)
- [Helpers](#helpers)
  - [children](#children)
  - [classes](#classes)
  - [direction](#direction)
  - [event](#event)
  - [event-path](#event-path)
  - [host](#host)
  - [is-ltr](#is-ltr)
  - [is-rtl](#is-rtl)
  - [is-server](#is-server)
  - [query](#query)
  - [slots](#slots)
  - [styles](#styles)
  - [to-unit](#to-unit)
  - [type-of](#type-of)
- [Services](#services)
  - [Link](#link)
- [Compiler](#compiler)

## Install
Choose one of the commands.

### With NPM:
```bash
npm init @htmlplus/element@latest
```
### With Yarn:
```bash
yarn create @htmlplus/element
```
### With PNPM:
```bash
pnpm create @htmlplus/element
```

## Start
```bash
npm i
npm start
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

## Decorators
TODO

### Element
TODO

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

### Property
TODO

Options:
- **attribute**: TODO
- **reflect**: TODO

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

### Event
TODO

Options:
- **name**: A string custom event name to override the default.
- **bubbles**: A Boolean indicating whether the event bubbles up through the DOM or not. default is `false`.
- **cancelable**: A Boolean indicating whether the event is cancelable. default is `false`.
- **composed**: A Boolean value indicating whether or not the event can bubble across the boundary between the shadow DOM and the regular DOM. The default is false.

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

### Method
TODO

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

### Watch
TODO

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

### Listen
TODO

Options:
  - **target**: TODO
  - **once**: TODO
  - **passive**: TODO
  - **signal**: TODO
  - **capture**: TODO

```tsx
import { Element, Listen } from '@htmlplus/element';

@Element()
export class MyButton {
  @Listen('click')
  onClick(event) { }
}
```

### State
TODO

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

### Bind
TODO

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

## Helpers
TODO

### children
TODO

```js
import { Element, children } from '@htmlplus/element';

@Element()
export class MyElement {
  connectedCallback() {
    console.log(children(this)); // [h1, h2, h3]
  }
}
```

```html
<my-element>
  <h1>Child 1</h1>
  <h2>Child 2</h2>
  <h3>Child 3</h3>
</my-element>
```

### classes
TODO

### direction
TODO

### event
TODO

### event-path
TODO

### host
TODO

### is-ltr
TODO

```js
import { Element, isLTR } from '@htmlplus/element';

@Element()
export class MyElement {
  connectedCallback() {
    console.log(isLTR(this));
  }
}
```

### is-rtl
TODO

### is-server
TODO

### query
TODO

### slots
TODO

### styles
TODO

### to-unit
TODO

### type-of
TODO

## Services
TODO

```js
import compiler from '@htmlplus/element/compiler';

const { start, next, finish } = compiler(
  ...plugins
);
```

## Compiler plugins
TODO

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