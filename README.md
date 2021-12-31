# Create Custom HTML Element
TODO

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
  - [classes](#classes)
  - [direction](#direction)
  - [event](#event)
  - [host](#host)
  - [isRTL](#isRtl)
  - [isServer](#isServer)
  - [query](#query)
  - [slots](#slots)
  - [styles](#styles)
  - [toUnit](#toUnit)
- [Lifecycles](#lifecycles)
  - [connectedCallback](#connectedCallback)
  - [disconnectedCallback](#disconnectedCallback)
  - [loadedCallback](#loadedCallback)
  - [updateCallback](#updateCallback)
  - [updatedCallback](#updatedCallback)
- [Services](#services)
  - [Link](#link)
- [Name configuration](#NameConfiguration)
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
TODO

```bash
cd htmlplus-project
npm i
npm start
```

## First element
TODO

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
export class SayGreeting {

  @Property()
  name?: string = 'Simon';

  render() {
    return <h1>Hi {this.name}</h1>
  }
}
```

```html
<say-greeting name="Jan" id="greeting"></say-greeting>

<script>
  document.getElementById('greeting').name; // Jan
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
  open() { 
    /* TODO */
  }
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
  onClick(event) { 
    /* TODO */
  }
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
import { Bind, Element } from '@htmlplus/element';

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

```js
import { direction } from '@htmlplus/element';
import * as Helpers from '@htmlplus/element/helpers';

direction === Helpers.direction // true
```

### classes
TODO

### direction
TODO

```js
import { Element, direction } from '@htmlplus/element';

@Element()
export class MyElement {
  connectedCallback() {
    direction(this); // 'ltr' | 'rtl'
  }
}
```

### event
TODO

Options: TODO

```js
import { Bind, Element, on, off } from '@htmlplus/element';

@Element()
export class MyElement {

  @Bind()
  onClick(event) {
    console.log(event);
  }

  connectedCallback() {
    on(window, 'click', this.onClick/*, options*/);
  }

  disconnectedCallback() {
    off(window, 'click', this.onClick/*, options*/);
  }
}
```

### host
TODO

```js
import { Element, host } from '@htmlplus/element';

@Element()
export class MyElement {
  connectedCallback() {
    host(this); // <my-element></my-element>
  }
}
```

### isRTL
TODO

```js
import { Element, isRTL } from '@htmlplus/element';

@Element()
export class MyElement {
  connectedCallback() {
    isRTL(this); // false | true
  }
}
```

### isServer
TODO

```js
import { Element, isServer } from '@htmlplus/element';

@Element()
export class MyElement {
  connectedCallback() {
    isServer(this) // false | true
  }
}
```

### query
TODO

```js
import { Element, query } from '@htmlplus/element';

@Element()
export class MyElement {

  connectedCallback() {
    query(this, 'h1');      // <h1></h1>
    query(this, '#first');  // <h2></h2>
    query(this, '.second'); // <h3></h3>
  }

  render() {
    <div>
      <h1></h1>
      <h2 id="first"></h2>
      <h3 class="second"></h3>
    </div>
  }
}
```

### slots
TODO

### styles
TODO

```js
import { Element, Property, styles } from '@htmlplus/element';

@Element()
export class MyElement {

  @Property()
  top?: number = 0;

  get styles() {
    return styles({
      top: this.top + 'px',
      position: 'absolute',
    })
  }
  
  render() {
    return <div style={this.styles}>
      <slot />
    </div>
  }
}
```

### toUnit
TODO

```js
import { Element, Property, toUnit } from '@htmlplus/element';

@Element()
export class MyElement {

  @Property()
  width?: string | number;
  
  render() {
    return <div style={`width: ${toUnit(this.width)}`}>
      <slot />
    </div>
  }
}
```

```html
<my-element width="150"  ></my-element> <!-- 150px -->
<my-element width="150px"></my-element> <!-- 150px -->
```

## Lifecycles
TODO

### connectedCallback
TODO

### disconnectedCallback
TODO

### loadedCallback
TODO

### updateCallback
TODO

### updatedCallback
TODO


## Services
TODO

## Name configuration
All examples below produce output `<plus-button></plus-button>`

### 1. Class name with at least 2 syllables

```js
import { Element } from '@htmlplus/element';

@Element()
export class PlusButton { }
```

### 2. Explicitly tag name

```js
import { Element } from '@htmlplus/element';

@Element('plus-button')
export class Button { }
```

### 3. With global prefix (recommended)

```js
import { Element } from '@htmlplus/element';

@Element()
export class Button { }
```
Use `prefix` key in `plus.config.js` file.
```js
export default [
  ...
  extract({
    prefix: 'plus',
  })
  ...
]
```

### 4. Conditional
TODO

## Compiler
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
import compiler from '@htmlplus/element/compiler';
import { read, parse, extract, attach, uhtml, print } from '@htmlplus/element/compiler';

const { start, next, finish } = compiler(
  read(),
  parse(),
  extract(),
  attach(),
  uhtml(),
  print(),
);

await start();

const { script } = await next('element.tsx');

await finish();
```