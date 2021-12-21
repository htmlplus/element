# Create Custom HTML Element

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
<plus-my-element></plus-my-element>
```

```tsx
import { Element, Property } from '@htmlplus/element';

@Element()
export class MyElement {

  @Property()
  name?: string = 'Simon';

  render() {
    return <h1>Hi {this.name}</h1>
  }
}

```

```html
<plus-my-element name="Jan"></plus-my-element>
```

```js
import { compiler } from '@htmlplus/element/compiler';

const { start, next, finish } = compiler(
  ...plugins
);
```

```js
import { compiler, plugins } from '@htmlplus/element/compiler';

const { start, next, finish } = compiler(
  plugins.read(),
  plugins.parse(),
  plugins.extract({
    prefix: 'plus',
  }),
  plugins.attach({
    members: true,
    styles: true,
  }),
  plugins.uhtml(),
  plugins.print(),
);

await start();

const { script } = await next('element.tsx');

await finish();
```