# Create Custom HTML Element

A powerful tool for building scalable, reusable, fast, and lightweight elements for any web technology — a single widget, a full `UI Component Library`, or an entire application — powered by [Custom Elements](https://mdn.io/using-custom-elements).

## Table Of Content

- [Features](#features)
- [Quick Start](#quick-start)
- [First Element](#first-element)
- [Decorators](#decorators)
- [Utilities](#utilities)
- [JSX](#jsx)
- [Lifecycles](#lifecycles)
- [Bundlers](#bundlers)
- [Transformer](#transformer)

## Features

- 🌐 **No Wrappers**: Works in every framework as it is, with events named the way each one expects.
- ⚡ **Compiler-Based**: Removes the repetitive work every component would otherwise carry, handling it automatically at build time.
- ✨ **Decorator-Based**: Properties, state, events, methods, context and more powerful features, all through decorators and with no extra packages.
- ✍️ **TypeScript + JSX**: Write elements in TypeScript and JSX, with type safety everywhere.
- 🪶 **Lightweight**: About 8 KB of runtime for a typical element, and under 11 KB for the whole library, minified and gzipped.
- 📘 **Typings**: TypeScript types are generated for you, with nothing to define by hand.
- 📦 **Bundler Plugin**: Not a toolchain of its own — it plugs into the bundler you already use. Vite and Rollup are supported today, with more on the way.
- ⚙️ **Global Config**: Configure every element from one place.
- 🔌 **Plugin-Based**: The build pipeline is made of plugins, with many included out of the box.
- 🖌️ **Custom Render Engine**: A dedicated rendering layer, built on Preact today and configurable in a future release.
- 🎨 **Style File Recognition**: Each element's style file is found and linked automatically.
- 🏷️ **Tag Name Recognition**: The tag name comes from the class name.
- 🧰 **Built-In Utilities**: A set of utility functions shared across elements.
- 🔒 **Secure**: Internal properties and methods stay out of reach.
- ✂️ **Clean Syntax**: Less code for the same result, and easier to read later.
- 🚧 **Server-Side Rendering**: Declarative Shadow DOM on the server, hydration in the browser. Not released yet.

## Quick Start

Before proceeding, ensure you have the latest LTS version of [Node.js](https://nodejs.org/en/download) installed on your system.

1- Create a new project

```bash
npm init @htmlplus/element@latest
```

2- Navigate to the project directory

```bash
cd htmlplus-project
```

3- Install the dependencies

```bash
npm i
```

4- Start the project

```bash
npm run dev
```

## First Element

An example demonstrating the implementation and usage of an element.

Each element is stored in a file such as `my-counter.tsx`.

```tsx
import { Element, State } from '@htmlplus/element';

@Element()
export class MyCounter {
  @State()
  value: number = 0;

  render() {
    return (
      <host value={this} onClick={() => this.value++}>
        Count is {this.value}
      </host>
    )
  }
}
```

The element's style is stored in a file such as `my-counter.css`, which shares the same name as the element file `my-counter.tsx`.

```css
:host {
  display: inline-block;
  border: 1px solid black;
  color: black;
  padding: 1em;
  cursor: pointer;
}
```

To execute the element, include it in the `index.html` file.

```html
<body>
  <my-counter></my-counter>
</body>
```

## Decorators

Decorators can greatly enhance code maintainability, improving efficiency, readability, and reusability.

<details>
  <summary>Bind</summary>

Used to bind a method of a class to the current context, making it easier to reference `this` within the method.

In the `my-counter.tsx` file.

```tsx
import { Bind, Element, State } from '@htmlplus/element';

@Element()
export class MyCounter {
  @State()
  value: number = 0;

  @Bind()
  onClick() {
    this.value++;
  }

  render() {
    return (
      <host value={this} onClick={this.onClick}>
        Count is {this.value}
      </host>
    )
  }
}
```

In the `index.html` file.

```html
<my-counter></my-counter>
```

</details>

<details>
  <summary>Consumer</summary>

Receives a value from an ancestor `@Provider()` that shares the same namespace. The property is kept in sync as the provided value changes.

In the `my-consumer.tsx` file.

```tsx
import { Consumer, Element } from '@htmlplus/element';

@Element()
export class MyConsumer {
  @Consumer('theme')
  theme?: string;

  render() {
    return <div>Theme is {this.theme}</div>
  }
}
```

In the `index.html` file.

```html
<my-provider>
  <my-consumer></my-consumer>
</my-provider>
```

</details>

<details>
  <summary>Debounce</summary>
  
Ensures that the method executes only after the specified delay, resetting the timer if called again within the delay period.

In the `my-element.tsx` file.

```tsx
import { Debounce, Element, State } from '@htmlplus/element';

@Element()
export class MyCounter {
  @State()
  value: number = 0;

  @Debounce()
  onClick() {
    this.value++;
  }

  render() {
    return (
      <host value={this} onClick={this.onClick}>
        Count is {this.value}
      </host>
    )
  }
}
```

In the `index.html` file.

```html
<body dir="rtl">
  <my-counter></my-counter>
</body>
```

</details>

<details>
  <summary>Direction</summary>
  
Indicates whether the [Direction](https://mdn.io/css-direction) of the element is `Right-To-Left` or `Left-To-Right`.

In the `my-element.tsx` file.

```tsx
import { Direction, Element } from '@htmlplus/element';

@Element()
export class MyElement {
  @Direction()
  direction!: 'ltr' | 'rtl';

  render()  {
    return (
      <div>
        The direction of the element is
        <u>
          {this.direction}
        </u>
      </div>
    )
  }
}
```

In the `index.html` file.

```html
<body dir="rtl">
  <my-element></my-element>
</body>
```

</details>

<details>
  <summary>Element</summary>

The class marked with this decorator is considered a [Custom Element](https://mdn.io/using-custom-elements), and its name, in kebab-case, serves as the element name.

> It is important to note that each file can only contain one class with this condition.

In the `say-hello.tsx` file.

```tsx
import { Element } from '@htmlplus/element';

@Element()
export class SayHello {
  render() {
    return <div>Hello World</div>
  }
}
```

In the `index.html` file.

```html
<say-hello></say-hello>
```

</details>

<details>
  <summary>Event</summary>
  
Provides the capability to dispatch a [CustomEvent](https://mdn.io/custom-event) from an element.

Parameters:

- `options` (Optional)
  <br />
  An object that configures [options](https://developer.mozilla.org/docs/Web/API/Event/EventEvent#options) for the event dispatcher.
  <br />
  <br />
  - `bubbles` (Optional)
    <br />
    A boolean value indicating whether the event bubbles. The default is `false`.
    <br />
    <br />
  - `cancelable` (Optional)
    <br />
    A boolean value indicating whether the event can be cancelled. The default is `false`.
    <br />
    <br />
  - `composed` (Optional)
    <br />
    A boolean value indicating whether the event will trigger listeners outside of a shadow root (see [Event.composed](https://mdn.io/event-composed) for more details). The default is `false`.
    <br />
    <br />

In the `my-button.tsx` file.

```tsx
import { Element, Event, EventEmitter } from '@htmlplus/element';

@Element()
export class MyButton {
  @Event()
  myClick!: EventEmitter<string>;

  render() {
    return (
      <button onClick={() => this.myClick("It's a message form MyButton!")}>
        <slot />
      </button>
    )
  }
}
```

In the `index.html` file.

```html
<my-button id="button">Button</my-button>

<script>
  document
    .getElementById('button')
    .addEventListener('my-click', (event) => {
      alert(event.detail);
    });
</script>
```

</details>

<details>
  <summary>Host</summary>

Indicates the host of the element.

In the `my-element.tsx` file.

```tsx
import { Element, Host } from '@htmlplus/element';

@Element()
export class MyElement {
  @Host()
  host!: HTMLElement;

  get isSame() {
    return this.host == document.querySelector('my-element');
  }

  connectedCallback() {
    console.log('Is Same: ' + this.isSame);
  }
}
```

In the `index.html` file.

```html
<my-element></my-element>
```

</details>

<details>
  <summary>IsRTL</summary>

Indicates whether the direction of the element is `Right-To-Left` or not.

In the `my-element.tsx` file.

```tsx
import { Element, IsRTL } from '@htmlplus/element';

@Element()
export class MyElement {
  @IsRTL()
  isRTL!: boolean;

  render()  {
    return (
      <div>
        The direction of the element is
        <u>
          {this.isRTL ? 'rtl' : 'ltr'}
        </u>
      </div>
    )
  }
}
```

In the `index.html` file.

```html
<body dir="rtl">
  <my-element></my-element>
</body>
```

</details>

<details>
  <summary>Listen</summary>

Will be called whenever the specified event is delivered to the target [More](https://mdn.io/add-event-listener).

Parameters:

- `type` (Required)
  <br />
  A case-sensitive string representing the [Event Type](https://mdn.io/events) to listen for.
  <br />
  <br />
- `options` (Optional)
  <br />
  An object that configures [options](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener#options) for the event listener.
  <br />
  <br />
  - `capture` (Optional)
    <br />
    A boolean value indicating that events of this type will be dispatched to the registered `listener` before being dispatched to any `EventTarget` beneath it in the DOM tree. If not specified, defaults to `false`.
    <br />
    <br />
  - `once` (Optional)
    <br />
    A boolean value indicating that the `listener` should be invoked at most once after being added. If `true`, the `listener` would be automatically removed when invoked. If not specified, defaults to `false`.
    <br />
    <br />
  - `passive` (Optional)
    <br />
    A boolean value that, if `true`, indicates that the function specified by `listener` will never call [preventDefault()](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault). If a passive listener does call `preventDefault()`, the user agent will do nothing other than generate a console warning.
    <br />
    <br />
  - `signal` (Optional)
    <br />
    An [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal). The listener will be removed when the given `AbortSignal` object's [abort()](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) method is called. If not specified, no `AbortSignal` is associated with the listener.
    <br />
    <br />
  - `target` (Optional)
    <br />
    The target element, defaults to `host`.
    <br />
    <br />

In the `my-button.tsx` file.

```tsx
import { Element, Listen } from '@htmlplus/element';

@Element()
export class MyButton {
  @Listen('click')
  onClick(event) {
    alert('The my-button was clicked!');
  }

  render() {
    return <slot />
  }
}
```

In the `index.html` file.

```html
<my-button>Click Me</my-button>
```

</details>

<details>
  <summary>Method</summary>

Provides a way to encapsulate functionality within an element and invoke it as needed, both internally and externally.

In the `my-counter.tsx` file.

```tsx
import { Element, Method, State } from '@htmlplus/element';

@Element()
export class MyCounter {
  @State()
  value: number = 0;

  @Method()
  increase() {
    this.value++;
  }

  render() {
    return (
      <host value={this}>
        Count is {this.value}
      </host>
    )
  }
}
```

In the `index.html` file.

```html
<my-counter id="counter"></my-counter>

<script>
  setInterval(() => {
    document.getElementById('counter').increase();
  }, 1000);
</script>
```

</details>

<details>
  <summary>Property</summary>

Creates a reactive property, reflecting a corresponding attribute value, and updates the element when the property is set.

Parameters:

- `options` (Optional)
  <br />
  The configuration for property decorator.
  <br />
  <br />
  - `attribute` (Optional)
    <br />
    Specifies the name of the attribute related to the property.
    <br />
    <br />
  - `reflect` (Optional)
    <br />
    Whether property value is reflected back to the associated attribute. default is `false`.
    <br />
    <br />
  - `type` (Optional)
    <br />
    Specifies the property `type` and supports [data types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures). If this value is not set, it will be set automatically during transforming.
    <br />
    <br />

In the `say-greeting.tsx` file.

```tsx
import { Element, Property } from '@htmlplus/element';

@Element()
export class SayGreeting {
  @Property()
  name?: string = 'Simon';

  render() {
    return <div>Hi {this.name}</div>
  }
}
```

In the `index.html` file.

```html
<say-greeting name="Jan"></say-greeting>
```

</details>

<details>
  <summary>Provider</summary>

Shares a value with descendant elements through a namespace. Every `@Consumer()` with the same namespace reads it and stays in sync when it changes.

In the `my-provider.tsx` file.

```tsx
import { Element, Provider } from '@htmlplus/element';

@Element()
export class MyProvider {
  @Provider('theme')
  theme: string = 'dark';

  render() {
    return <slot />
  }
}
```

In the `index.html` file.

```html
<my-provider>
  <my-consumer></my-consumer>
</my-provider>
```

</details>

<details>
  <summary>Query</summary>

Selects the first element in the shadow dom that matches a specified CSS selector.

Parameters:

- `selectors` (Required)
  <br />
  A string containing one or more selectors to match. This string must be a valid CSS selector string; if it isn't, a `SyntaxError` exception is thrown. See [Locating DOM elements using selectors](https://developer.mozilla.org/en-US/docs/Web/API/Document_object_model/Locating_DOM_elements_using_selectors) for more about selectors and how to manage them.
  <br />
  <br />

In the `my-button.tsx` file.

```tsx
import { Element, Query } from '@htmlplus/element';

@Element()
export class MyButton {
  @Query('.btn')
  buttonRef!: HTMLButtonElement;

  readyCallback() {
    console.log(this.buttonRef); // <button class="btn"></button>
  }

  render() {
    return (
      <button class="btn">
        <slot />
      </button>
    )
  }
}
```

In the `index.html` file.

```html
<my-button>
  Button
</my-button>
```

</details>

<details>
  <summary>QueryAll</summary>

Selects all elements in the shadow dom that match a specified CSS selector.

Parameters:

- `selectors` (Required)
  <br />
  A string containing one or more selectors to match against. This string must be a valid [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors) string; if it's not, a `SyntaxError` exception is thrown. See [Locating DOM elements using selectors](https://developer.mozilla.org/en-US/docs/Web/API/Document_object_model/Locating_DOM_elements_using_selectors) for more information about using selectors to identify elements. Multiple selectors may be specified by separating them using commas.
  <br />
  <br />

In the `my-button.tsx` file.

```tsx
import { Element, QueryAll } from '@htmlplus/element';

@Element()
export class MyButton {
  @QueryAll('span')
  spanRefs!: NodeList;

  readyCallback() {
    console.log(this.spanRefs); // [span, span]
  }

  render() {
    return (
      <button>
        <span> Suffix </span>
        <b>
          <slot />
        </b>
        <span> Prefix </span>
      </button>
    )
  }
}
```

In the `index.html` file.

```html
<my-button>
  Button
</my-button>
```

</details>

<details>
  <summary>Slots</summary>
  
Returns the slots name.

In the `my-element.tsx` file.

```tsx
import { Element, Slots } from '@htmlplus/element';

@Element()
export class MyElement {
  @Slots()
  slots;

  connectedCallback() {
    console.log(this.slots); // {header: true, default: true, footer: true}
  }

  render() {
    return (
      <host value={this}>
        <slot name="header"></slot>
        <slot></slot>
        <slot name="footer"></slot>
      </host>
    )
  }
}
```

In the `index.html` file.

```html
<my-element>
  <div slot="header">HEADER</div>
  <div>BODY</div>
  <div slot="footer">FOOTER</div>
</my-element>
```

</details>

<details>
  <summary>State</summary>

Applying this decorator to any `class property` will trigger the element to re-render upon the desired property changes.

In the `my-button.tsx` file.

```tsx
import { Element, State } from '@htmlplus/element';

@Element()
export class MyButton {
  @State()
  active?: boolean;

  toggle() {
    this.active = !this.active;
  }

  render() {
    return (
      <button onClick={() => this.toggle()}>
        Click To Change The Status ({this.active ? 'On' : 'Off'})
      </button>
    )
  }
}
```

In the `index.html` file.

```html
<my-button></my-button>
```

</details>

<details>
  <summary>Watch</summary>
  
Monitors `@Property()` and `@State()` to detect changes. The decorated method will be called after any changes, with the `key`, `newValue`, and `oldValue` as parameters. If the `key` is not defined, all `@Property()` and `@State()` are considered.

Parameters:

- `keys` (Optional)
  <br />
  Collection of `@Property()` and `@State()` names.
  <br />
  <br />
- `immediate` (Optional)
  <br />
  Triggers the callback immediately after initialization.
  <br />
  <br />

In the `my-element.tsx` file.

```tsx
import { Element, Property, Watch } from '@htmlplus/element';

@Element()
export class MyElement {
  @Property()
  value?: string;

  @Watch('value')
  watcher(key, newValue, oldValue) {
    console.log(key, newValue, oldValue);
  }
}
```

In the `index.html` file.

```html
<my-element id="element"></my-element>

<script>
  setInterval(() => {
    document.getElementById('element').value = new Date();
  }, 1000);
</script>
```

</details>

## Utilities

Helper functions shared across elements. Most mirror a decorator, for when you need the same behavior imperatively instead of as a class field, and take the element (`this`) as their first argument.

<details>
  <summary>classes</summary>

Builds a class string from a string, an array, or an object. Object keys become kebab-case classes when their value is truthy. With `smart` enabled, string and number values are appended as `key-value`.

```js
classes('a b')                                // 'a b'
classes(['a', { fooBar: true, baz: false }])  // 'a foo-bar'
classes({ size: 'sm', loading: true }, true)  // 'size-sm loading'
```

</details>

<details>
  <summary>getConfig</summary>

Reads the shared config for a namespace, as defined by `setConfig`.

```js
getConfig('plus'); // { assets: { path: '/assets' } }
```

</details>

<details>
  <summary>setConfig</summary>

Stores shared options for every element in a namespace. Calls are deep-merged, so later ones extend earlier ones. Pass `{ override: true }` to replace instead.

```js
import { setConfig } from '@htmlplus/element';

setConfig('plus', {
  assets: { path: '/assets' }
});
```

</details>

<details>
  <summary>direction</summary>

Returns the resolved [direction](https://mdn.io/css-direction) of the element, `ltr` or `rtl`.

```js
direction(this); // 'ltr'
```

</details>

<details>
  <summary>dispatch</summary>

Creates a [CustomEvent](https://mdn.io/custom-event) and dispatches it from the element. Returns the event.

```js
dispatch(this, 'change', { detail: this.value });
```

</details>

<details>
  <summary>host</summary>

Returns the host element of the element instance.

```js
host(this); // <my-element>
```

</details>

<details>
  <summary>isCSSColor</summary>

Determines whether the given input string is a valid
[CSS Color](https://developer.mozilla.org/docs/Web/CSS/color_value)
or not.

```js
isCSSColor('red')                       // true
isCSSColor('#ff0000')                   // true
isCSSColor('#ff000080')                 // true
isCSSColor('rgb(255, 0, 0)')            // true
isCSSColor('rgba(255, 0, 0, 0.3)')      // true
isCSSColor('hsl(120, 100%, 50%)')       // true
isCSSColor('hsla(120, 100%, 50%, 0.3)') // true
isCSSColor('invalid color')             // false
```

</details>

<details>
  <summary>isCSSUnit</summary>

Determines whether the given input string is a valid
[CSS length](https://mdn.io/length) or not.

```js
isCSSUnit('10px')   // true
isCSSUnit('1.5rem') // true
isCSSUnit('50%')    // true
isCSSUnit('10')     // false
isCSSUnit('foo')    // false
```

</details>

<details>
  <summary>isRTL</summary>

Returns `true` when the element's direction is `Right-To-Left`.

```js
isRTL(this); // false
```

</details>

<details>
  <summary>on</summary>

Adds an event listener to the host. The special `outside` type fires when the event happens anywhere outside the element.

```js
on(this, 'click', () => console.log('clicked'));
on(this, 'outside', () => console.log('clicked outside'));
```

</details>

<details>
  <summary>off</summary>

Removes a listener added with `on`.

```js
off(this, 'click', handler);
```

</details>

<details>
  <summary>query</summary>

Selects the first element in the shadow dom that matches a specified CSS selector.

```js
query(this, '.btn'); // <button class="btn">
```

</details>

<details>
  <summary>queryAll</summary>

Selects all elements in the shadow dom that match a specified CSS selector.

```js
queryAll(this, 'span'); // NodeList(2)
```

</details>

<details>
  <summary>slots</summary>

Returns an object with the names of the slots that currently have content.

```js
slots(this); // { default: true, footer: true }
```

</details>

## JSX

Elements are written in JSX. It runs on a small Preact-based renderer, so most of what you know carries over: `className`, `style` objects, conditional rendering, and fragments.

<details>
  <summary>host</summary>

`<host>` refers to the custom element itself. Use it to set attributes, classes, styles, or listeners on the host and to wrap the element's content. It needs `value={this}` so the renderer can find the host.

```tsx
render() {
  return (
    <host value={this} class="card" onClick={this.onClick}>
      <slot />
    </host>
  )
}
```

`<host>` is optional. Return any element directly when you don't need to touch the host.

```tsx
render() {
  return <button><slot /></button>
}
```

</details>

## Lifecycles

Elements encompass several lifecycle methods, each triggered at different stages in the element's life cycle, enabling developers to control the element's behavior and perform customized actions.

<details>
  <summary>adoptedCallback</summary>

Invoked when the element is moved to a new document, for example via [`document.adoptNode`](https://mdn.io/adopt-node).

```js
import { Element } from '@htmlplus/element';

@Element()
export class MyElement {
  adoptedCallback() {
    console.log('Element was adopted!');
  }
}
```

</details>

<details>
  <summary>connectedCallback</summary>

Invoked when an element is added to the document's DOM.

```js
import { Element } from '@htmlplus/element';

@Element()
export class MyElement {
  connectedCallback() {
    console.log('Element is connected!');
  }
}
```

</details>

<details>
  <summary>disconnectedCallback</summary>

Invoked when an element is removed from the document's DOM.

```js
import { Element } from '@htmlplus/element';

@Element()
export class MyElement {
  disconnectedCallback() {
    console.log('Element is disconnected!');
  }
}
```

</details>

<details>
  <summary>readyCallback</summary>

Invoked after the elements's DOM has been updated the first time, immediately before `updatedCallback` is called.

```js
import { Element } from '@htmlplus/element';

@Element()
export class MyElement {
  readyCallback() {
    console.log('Element is ready!');
  }
}
```

</details>

<details>
  <summary>updateCallback</summary>

Invoked before the element is rendered, this method receives a Map where keys represent the names of changed properties, and values hold their corresponding previous states. Modifying Properties/State within this method does not trigger an element update.

```js
import { Element, Property } from '@htmlplus/element';

@Element()
export class MyElement {
  @Property()
  value?: number = 0;

  updateCallback(changes) {
    console.log('Changed properties are: ', changes);
  }
}
```

</details>

<details>
  <summary>updatedCallback</summary>

Invoked after the element is rendered, this method receives a Map where keys represent the names of changed properties, and values hold their corresponding previous states.

```js
import { Element, Property } from '@htmlplus/element';

@Element()
export class MyElement {
  @Property()
  value?: number = 0;

  updatedCallback(changes) {
    console.log('Changed properties are: ', changes);
  }
}
```

</details>

## Bundlers

`@htmlplus/element` plugs into the bundler you already use. The plugin transforms each element file and, after the build, emits the extra artifacts (types, docs, editor metadata).

Every built-in plugin can be configured, or turned off, through the options object:

```ts
htmlplus({
  style: {},
  assets: {},
  types: {},
  document: {},
  visualStudioCode: {},
  webTypes: { enable: false }
})
```

<details>
  <summary>Rollup</summary>

In the `rollup.config.js` file.

```js
import { rollup as htmlplus } from '@htmlplus/element/bundlers.js';

export default {
  plugins: [htmlplus()]
};
```

</details>

<details>
  <summary>Vite</summary>

In the `vite.config.ts` file.

```ts
import { vite as htmlplus } from '@htmlplus/element/bundlers.js';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [htmlplus()]
});
```

</details>
