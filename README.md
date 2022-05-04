# Create Custom HTML Element

[![Version](https://img.shields.io/npm/v/@htmlplus/element.svg)](https://www.npmjs.com/package/@htmlplus/element)
[![GitHub forks](https://img.shields.io/github/forks/htmlplus/element)](https://github.com/htmlplus/element/network/members)
[![GitHub stars](https://img.shields.io/github/stars/htmlplus/element)](https://github.com/htmlplus/element/stargazers)
[![GitHub license](https://img.shields.io/github/license/htmlplus/element)](https://github.com/htmlplus/core/blob/main/LICENSE)
[![Linkedin](https://img.shields.io/badge/Follow%20us-white?logo=linkedIn&color=0077B5&logoColor=white)](https://www.linkedin.com/company/htmlplus)
[![code coverage](https://img.shields.io/coveralls//htmlplus/element/.svg?style=flat-square)](https://coveralls.io/r/htmlplus/element/)
[![install size](https://packagephobia.now.sh/badge?p=element)](https://packagephobia.now.sh/result?p=element)

Element is powerful library for building scalable, reusable design system for any technology.
It is one of the fastest and most testable libraries for building web components on the web.
Completely compatible for Typescript and tsx.

## Table of content

- [Install](#install)
- [Start](#start)
- [First Element](#FirstElement)
- [Styles](#Styles)
- [Development Environment](#DevelopmentEnvironment)
- [Decorators](#decorators)
- [Helpers](#helpers)
- [Lifecycles](#lifecycles)
- [Services](#services)
- [Tag Name Configuration](#TagNameConfiguration)
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

```bash
cd htmlplus-project
```

To start your Element project, run:

```bash
# with npm
npm i
npm start

# with yarn
yarn install
yarn start

# with pnpm
pnpm install
pnpm start
```

## First Element

Element is based on classes, so all components are based on `decorator`.
The decorator converts the next component code based on it's properties during the build.

```tsx
// my-element/my-element.tsx

import { Element } from '@htmlplus/element';

@Element('my-element')
export class MyElement {
  render() {
    return <h1>Hi Everybody</h1>
  }
}
```

The result of this component after build is provide `my-element` web component.

```html
<my-element></my-element>
```

## Styles

The element automatically adds a same name style file to this component. Create `my-element.scss` file for style.

```scss
// my-element/my-element.scss

:host {
  display: block;
  background-color: red;
  font-size: 2rem;
}
```

## Development Environment

For run any of the component, you must write element name tag into the `public/index.html`

```html
<!-- public/index.html -->

<body>
  <my-element></my-element>
</body>
```

## Decorators

With the introduction of Classes in TypeScript and ES6, there now exist certain scenarios that require additional features to support annotating or modifying classes and class members. Decorators provide a way to add both annotations and a meta-programming syntax for class declarations and members [More information](https://www.typescriptlang.org/docs/handbook/decorators.html).

<details>
  <summary>Element</summary>

Any component must be decorated with `@Element()` decorator. It also makes your web component tag name.

Options:

- **name**: `String` tag name

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

</details>

<details>
  <summary>Property</summary>

Property is decorated all the component properties for exposed attributes.

Options:

- **attribute**: TODO
- **reflect**: `Boolean` For watch mode, when you want to be notified of the attribute change.

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

Components can emit data and events using the Event decorator.

Options:

- **name**: A `String` custom event name to override the default.
- **bubbles**: A `Boolean` indicating whether the event bubbles up through the DOM or not. default is `false`.
- **cancelable**: A `Boolean` indicating whether the event is cancelable. default is `false`.
- **composed**: A `Boolean` value indicating whether or not the event can bubble across the boundary between the shadow DOM and the regular DOM. The default is `false`.

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

Ths `@Method` decorator can be called directly from the element. It can be called from the outside.

```tsx
import { Element, Method, State } from '@htmlplus/element';

@Element()
export class MyCounter {

  @State()
  counter?: number;

  @Method()
  increase() {
    this.counter++;
  }

  render() {
    return (
      <button>
        {this.counter}
      </button>
    )
  }
}
```

```html
<my-counter id="counter"></my-counter>

<script>
  document.getElementById('counter').increase();
</script>
```

</details>

<details>
  <summary>Attributes</summary>

TODO

```tsx
import { Attributes, Element } from '@htmlplus/element';

@Element('my-button')
export class MyButton {

  @Attributes()
  get attributes() {
    return {
      role: 'button'
    }
  }

  render() {
    return <button><slot /></button>
  }
}
```

```html
<my-button role="button"></my-button>
```

</details>

<details>
  <summary>Watch</summary>

`@Watch` take the name of the `@Property` and `@State` variable to monitor as a parameter. Any time the value of that property changes the function decorated by `@Watch` will be invoked with the `key`, `newValue` and `oldValue` as parameters. This is called first out of the lifecycle callbacks after a property changes.

- **name**: `String` property name

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

The `@Listen` decorates a function that will handle the event.
It takes two parameter, event name and event config.

Options:

- **target**: `body | document | window | host` This option allows us to set where we will listen for the event.
- **once**: `Boolean` Listen just for one time.
- **passive**: `Boolean` This will guarantee to the DOM that the event being fired will not `.stopPropagation()`.
- **signal**: TODO
- **capture**: `Boolean` This option is about when during the event lifecycle the handler will be called.

```tsx
import { Element, Listen } from '@htmlplus/element';

@Element()
export class MyButton {
  @Listen('click')
  onClick(event) {}
}
```

```tsx
import { Element, Listen } from '@htmlplus/element';

@Element()
export class MyContainer {
  @Listen('scroll', { target: 'window' })
  onScroll(event) {}
}
```

```tsx
import { Element, ListenOptions } from '@htmlplus/element';

@Element()
export class MyButton {

  @ListenOptions({ once: true })
  onClick(event) {}

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

The `@State` decorator is for manage data inside the component.
Any changes of `@State` will cause the render function to called again.

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

The `@Bind` for decorating methods only, by binding them to the current context.

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

  disconnectedCallback() {
    document.removeEventListener('scroll', this.onScroll);
  }
}
```

</details>

## Helpers

What is helpers?

Helpers are a versatile tool in the web component building project that eliminates the need for rewriting.

You can import `Helpers` two ways:

```js
import { direction } from '@htmlplus/element';
import * as Helpers from '@htmlplus/element/helpers';

direction === Helpers.direction; // true
```

<details>
  <summary>classes</summary>

TODO
`¯\_(ツ)_/¯`

</details>

<details>
  <summary>direction</summary>

This helper returns `ltr` or `rtl` from component.

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

`Event` is a wrapper of event listener, in JavaScript. `on` is like a `addEventListener` and `off` is like `removeEventListener` and used when you want to add or remove event on `window | documnet | Element`.

Options:

- target: `window | documnet | Element`
- event: `string`
- handler: `EventListenerOrEventListenerObject`
- options: `boolean | AddEventListenerOptions`

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

Returns output element of component.

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

Returns a `boolean` to diagnosis direction style of element.

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

Is a way to understand to component is mounted in DOM or not.

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

Is a wrapper of `querySelector` Is a way to find an element with a specific features.

Options:

- target: `HTML Element` or `Element Component(this)`
- selectors: `string` any specific features such as `id`, `class`, `element name`, ...

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

Is a wrapper of `querySelectorAll` Is a way to find an array of elements with a specific features.

Options:

- target: `HTML Element` or `Element Component(this)`
- selectors: `string` any specific features such as `id`, `class`, `element name`, ...

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

Sometimes components need to render dynamic children in specific locations in their component, so we use `slot` for separate these.

`slots` return the state of the slots of a component (is empty or not).

```js
import { Element, Property, slots } from '@htmlplus/element';

@Element()
export class MyElement {

  loadedCallback() {
    slots(this) // { default: true, main: true, empty: false }
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
  <h3 slot="extra"></h3>
</my-element>
```

</details>

<details>
  <summary>styles</summary>

Returns css style of your `array` or `object` style.

Options:

- input: `array | object`

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

Transformer to `number` type or make unit based on unit input.

Options:

- input: `number | string`
- unit: `string`

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

Components have numerous lifecycle methods which can be used to know when the component.

<details>
  <summary>connectedCallback</summary>

Called every time the component is connected to the DOM. When the component is first connected, this method is called before `loadedCallback`.

```js
import { Element } from '@htmlplus/element';

@Element()
export class MyElement {

  connectedCallback() {
    console.log("Component is connected!")
  }

  render() {
    return (
      <slot />
    )
  }
}
```

</details>

<details>
  <summary>disconnectedCallback</summary>

Called every time the component is disconnected from the DOM.

```js
import { Element } from '@htmlplus/element';

@Element()
export class MyElement {

  disconnectedCallback() {
    console.log("Component is disconnected!")
  }

  render() {
    return (
      <slot />
    )
  }
}
```

</details>

<details>
  <summary>loadedCallback</summary>

Called once just after the component is fully loaded and the first `render()`.

```js
import { Element } from '@htmlplus/element';

@Element()
export class MyElement {

  loadedCallback() {
    console.log("Component is loaded!")
  }

  render() {
    return (
      <slot />
    )
  }
}
```

</details>

<details>
  <summary>updatedCallback</summary>

Called everytime when `states` or `props` changed.It's never called during the first `render()`.

```js
import { Element } from '@htmlplus/element';

@Element()
export class MyElement {

  loadedCallback(prevProps, prevState, snapshot) {
    console.log("Component is updated!")
  }

  render() {
    return (
      <slot />
    )
  }
}
```

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

## Tag Name Configuration

All examples below produce output `<plus-button></plus-button>`

<details>
  <summary>Explicitly tag name</summary>

You can give the final name of your component as an input to the `@Element`.

```js
import { Element } from '@htmlplus/element';

@Element('plus-button')
export class Button {}
```

</details>

<details>
  <summary>Class name with at least 2 syllables</summary>

The name of your element should eventually be `two` syllables.

```js
import { Element } from '@htmlplus/element';

@Element()
export class PlusButton {} // <plus-button></plus-button>
```

</details>

<details>
  <summary>With global prefix (recommended)</summary>

You can set a prefix for all elements and this prefix attached to all elements.

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
import compiler from '@htmlplus/element/compiler/index.js';
import { customElement, extract, parse, read, style, validate } from '@htmlplus/element/compiler/index.js';

const { start, next, finish } = compiler(
  read(),
  parse(),
  validate(),
  extract(),
  style(),
  customElement(),
);

await start();

const { script } = await next('element.tsx');

await finish();
```
