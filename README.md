# Create Custom HTML Element

TODO

## Table of content

- [Install](#install)
- [Start](#start)
- [First element](#Firstelement)
- [Decorators](#decorators)
- [Helpers](#helpers)
- [Lifecycles](#lifecycles)
- [Services](#services)
- [Tag name configuration](#TagNameConfiguration)
- [Compiler](#compiler)

## Install

Choose one of the commands.

```bash
# with npm
npm init @htmlplus/element@latest

# with yarn
yarn create @htmlplus/element

# with pnpm
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

<details>
  <summary>Element</summary>

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

</details>

<details>
  <summary>Property</summary>

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

</details>

<details>
  <summary>Event</summary>

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
    return (
      <button onClick={() => this.clicked()}>
        <slot />
      </button>
    )
  }
}
```

```html
<my-button id="button">Button</my-button>

<script>
  document.getElementById('button').addEventListener('clicked', () => alert('Clicked!'));
</script>
```

</details>

<details>
  <summary>Method</summary>

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

</details>

<details>
  <summary>Watch</summary>

TODO

```tsx
import { Element, Property, Watch } from '@htmlplus/element';

@Element()
export class MyElement {

  @Property()
  name?: string;

  @Watch('name')
  watcher(key, newValue, oldValue) {}
}
```

</details>

<details>
  <summary>Listen</summary>

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

</details>

<details>
  <summary>ListenOptions</summary>

TODO

Options:

- **once**: TODO
- **passive**: TODO
- **signal**: TODO
- **capture**: TODO

```tsx
import { Element, ListenOptions } from '@htmlplus/element';

@Element()
export class MyButton {

  @ListenOptions({ once: true })
  onClick(event) {
    /* TODO */
  }

  render() {
    return (
      <button onClick={this.onClick}>
        <slot />
      </button>
    )
  }
}
```

</details>

<details>
  <summary>State</summary>

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
    return (
      <button>
        {this.active ? 'On' : 'Off'}
      </button>
    )
  }
}
```

</details>

<details>
  <summary>Bind</summary>

### Bind

TODO

```tsx
import { Bind, Element } from '@htmlplus/element';

@Element()
export class MyButton {

  @Bind()
  onScroll(event) {
    console.log(event);
  }

  connectedCallback() {
    document.addEventListener('scroll', this.onScroll);
  }
}
```

</details>

## Helpers

TODO

```js
import { direction } from '@htmlplus/element';
import * as Helpers from '@htmlplus/element/helpers';

direction === Helpers.direction; // true
```

<details>
  <summary>classes</summary>

TODO

</details>

<details>
  <summary>direction</summary>

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

</details>

<details>
  <summary>event</summary>

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
    on(window, 'click', this.onClick /*, options*/);
  }

  disconnectedCallback() {
    off(window, 'click', this.onClick /*, options*/);
  }
}
```

</details>

<details>
  <summary>host</summary>

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

</details>

<details>
  <summary>isRTL</summary>

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

</details>

<details>
  <summary>isServer</summary>

TODO

```js
import { Element, isServer } from '@htmlplus/element';

@Element()
export class MyElement {
  connectedCallback() {
    isServer(this); // false | true
  }
}
```

</details>

<details>
  <summary>query</summary>

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
    return (
      <div>
        <h1></h1>
        <h2 id="first"></h2>
        <h3 class="second"></h3>
      </div>
    )
  }
}
```

</details>

<details>
  <summary>queryAll</summary>

TODO

```js
import { Element, queryAll } from '@htmlplus/element';

@Element()
export class MyElement {

  connectedCallback() {
    queryAll(this, 'div > *'); // [<h1></h1>, <h2></h2>, <h3></h3>]
  }

  render() {
    return (
      <div>
        <h1></h1>
        <h2 id="first"></h2>
        <h3 class="second"></h3>
      </div>
    )
  }
}
```

</details>

<details>
  <summary>slots</summary>

```js
import { Element, Property, slots } from '@htmlplus/element';

@Element()
export class MyElement {

  loadedCallback() {
    /**
     * { 
     *   default: [<h1/>], 
     *   main:    [<h2/>, <h3/>], 
     *   empty:   undefined,
     * }
     */
    slots(this)
  }

  render() {
    return (
      <div>
        <slot />
        <slot name="main" />
        <slot name="empty" />
      </div>
    )
  }
}
```

```html
<my-element>
  <h1></h1>
  <h2 slot="main"></h2>
  <h3 slot="main"></h3>
  <h4 slot="extra"></h4>
</my-element>
```

</details>

<details>
  <summary>styles</summary>

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
    return (
      <div style={this.styles}>
        <slot />
      </div>
    )
  }
}
```

</details>

<details>
  <summary>toUnit</summary>

TODO

```js
import { Element, Property, toUnit } from '@htmlplus/element';

@Element()
export class MyElement {

  @Property()
  width?: string | number;

  render() {
    return (
      <div style={`width: ${toUnit(this.width)}`}>
        <slot />
      </div>
    )
  }
}
```

```html
<my-element width="150"></my-element>   <!-- 150px -->
<my-element width="150px"></my-element> <!-- 150px -->
```

</details>

## Lifecycles

TODO

<details>
  <summary>connectedCallback</summary>

TODO

</details>

<details>
  <summary>disconnectedCallback</summary>

TODO

</details>

<details>
  <summary>loadedCallback</summary>

TODO

</details>

<details>
  <summary>updateCallback</summary>

TODO

</details>

<details>
  <summary>updatedCallback</summary>

TODO

</details>

<details>
  <summary>adoptedCallback</summary>

TODO

</details>

## Services

TODO

<details>
  <summary>Link</summary>

TODO

</details>

## Tag name configuration

All examples below produce output `<plus-button></plus-button>`

<details>
  <summary>Explicitly tag name</summary>

TODO

```js
import { Element } from '@htmlplus/element';

@Element('plus-button')
export class Button {}
```

</details>

<details>
  <summary>Class name with at least 2 syllables</summary>

TODO

```js
import { Element } from '@htmlplus/element';

@Element()
export class PlusButton {}
```

</details>

<details>
  <summary>With global prefix (recommended)</summary>

TODO

```js
import { Element } from '@htmlplus/element';

@Element()
export class Button {}
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

</details>

<details>
  <summary>Conditional</summary>

TODO

</details>

## Compiler

TODO

```js
import compiler from '@htmlplus/element/compiler';

const { start, next, finish } = compiler(...plugins);
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
