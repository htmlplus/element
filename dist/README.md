# Create Custom HTML Element

A powerful tool for building a scalable, reusable, fast, and lightweight `UI Component Library` for any web technologies, powered by [Custom Elements](https://mdn.io/using-custom-elements).

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

- **Plugin-Based**: Facilitates the seamless development of diverse plugins and the customization of outputs to meet specific requirements
- **Built-In Plugins**: Provides a variety of plugins that cater to different requirements.
- **Global Config**: Provides the ability to define global configs for all elements.
- **Typings**: Creates TypeScript types for seamless element usage across different environments.
- **TypeScript + JSX**: Using two powerful tools, TypeScript and JSX, to create elements.
- **Built-In Utilities**: Provides a set of JavaScript utility functions used across multiple elements.
- **Secure**: Restricts unwanted access to internal properties and methods.
- **Style File Recognition**: Identifies and links the relevant style file to the element.
- **Tag Name Recognition**: Generates tag name from the class name.
- **Clean Syntax**: Uses a minimal amount of code to achieve the same functionality, making the code easier to read, understand, and maintain.
- **Attribute Over Class**: Uses HTML attributes instead of HTML class names to keep the size of the start tag short, making it more readable and preventing the DOM from getting dirty.

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
npm start
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
      <host onClick={() => this.value++}>
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
      <host onClick={this.onClick}>
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
      <host>
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
  - `reflect` (Optional)
    <br />
    Whether property value is reflected back to the associated attribute. default is `false`.
    <br />
    <br />
  - `type` (Optional)
    <br />
    Do not set the value to this property. This value is automatically set during transpiling.
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

  loadedCallback() {
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

  loadedCallback() {
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
      <host>
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

Utilities are a versatile tool in element building projects, eliminating the need for rewriting.

<details>
  <summary>classes</summary>
TODO
</details>

<details>
  <summary>getConfig</summary>
TODO
</details>

<details>
  <summary>setConfig</summary>
TODO
</details>

<details>
  <summary>direction</summary>

Indicates whether the [Direction](https://mdn.io/css-direction) of the element is `Right-To-Left` or `Left-To-Right`.

TODO

</details>

<details>
  <summary>host</summary>
  
Indicates the host of the element.

TODO

</details>

<details>
  <summary>isCSSColor</summary>

Determines whether the given input string is a valid
[CSS Color](https://developer.mozilla.org/docs/Web/CSS/color_value)
or not.

TODO

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
  <summary>isRTL</summary>

Indicates whether the direction of the element is `Right-To-Left` or not.

TODO

</details>

<details>
  <summary>on</summary>
TODO 
</details>

<details>
  <summary>off</summary>
TODO 
</details>

<details>
  <summary>query</summary>

Selects the first element in the shadow dom that matches a specified CSS selector.

TODO

</details>

<details>
  <summary>queryAll</summary>
  
Selects all elements in the shadow dom that match a specified CSS selector.

TODO

</details>

<details>
  <summary>slots</summary>

Returns the slots name.

TODO

</details>

<details>
  <summary>styles</summary>
  
Converts a JavaScript object containing CSS styles to a CSS string.

TODO

</details>

<details>
  <summary>toUnit</summary>

Converts a value to a unit.

TODO

</details>

## JSX

TODO

<details>
  <summary>host</summary>

TODO

</details>

<details>
  <summary>part</summary>

TODO

</details>

## Lifecycles

Elements encompass several lifecycle methods, each triggered at different stages in the element's life cycle, enabling developers to control the element's behavior and perform customized actions.

<details>
  <summary>adoptedCallback</summary>

TODO

</details>

<details>
  <summary>connectCallback</summary>

TODO

</details>

<details>
  <summary>connectedCallback</summary>

A lifecycle callback method that is called each time the element is added to the document.

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

TODO

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
  <summary>loadedCallback</summary>

TODO

```js
import { Element } from '@htmlplus/element';

@Element()
export class MyElement {
  loadedCallback() {
    console.log('Element is loaded!');
  }
}
```

</details>

<details>
  <summary>updateCallback</summary>

TODO

</details>

<details>
  <summary>updatedCallback</summary>

TODO

</details>

## Bundlers

TODO

<details>
  <summary>Rollup</summary>

TODO

</details>

<details>
  <summary>Vite</summary>

TODO

</details>

## Transformer

TODO

<details>
  <summary>Getting Started</summary>

TODO

```ts
import { TransformerPlugin, transformer } from '@htmlplus/element';
import {
  customElement,
  extract,
  parse,
  read,
  style,
  validate,
} from '@htmlplus/element/transformer/index.js';

const plugins = [
  read(),
  parse(),
  validate(),
  extract(),
  style(),
  customElement()
];

const { start, run, finish } = transformer(...plugins);

await start();

const context1 = await run('/my-avatar.tsx');
const context2 = await run('/my-button.tsx');
const context3 = await run('/my-switch.tsx');

await finish();
```

</details>

<details>
  <summary>Plugins</summary>

TODO

```ts
import {
  assets,
  copy,
  customElement,
  document,
  extract,
  parse,
  read,
  readme,
  style,
  validate,
  visualStudioCode,
  webTypes
} from '@htmlplus/element/transformer/index.js';
```

</details>
