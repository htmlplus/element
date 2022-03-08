// file1

```ts
export declare class SignatureComponent {
  /**
   * Comment
   */
  property?: any;
  /**
   * Comment
   */
  plusEvent: EventEmitter<any>;
  /**
   * Comment
   */
  method(): Promise<any>;

  localVar: any;
  localMethod(): void;

  connectedCallback(): void;
  disconnectedCallback(): void;

  render(): any;
}
```

// file2

```ts
export namespace Components {
    interface WowSignature {
        /**
         * Comment
         */
        "property"?: any;
        /**
         * Comment
         */
        "method": () => Promise<any>;
    }
}
declare global {
    interface HTMLWowSignatureElement extends Components.WowSignature, HTMLStencilElement {
    }
    var HTMLWowSignatureElement: {
        prototype: HTMLWowSignatureElement;
        new (): HTMLWowSignatureElement;
    };
    interface HTMLElementTagNameMap {
        "wow-signature": HTMLWowSignatureElement;
    }
}
declare namespace LocalJSX {
    interface WowSignature {
        /**
         * Comment
         */
        "property"?: any;
        /**
         * Comment
         */
        "plusEvent"?: (event: CustomEvent<any>) => void;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "wow-signature": LocalJSX.WowSignature & JSXBase.HTMLAttributes<HTMLWowSignatureElement>;
        }
    }
}
```

// file3

```ts
/* eslint-disable */
/* tslint:disable */
/* auto-generated react proxies */
import { createReactComponent } from './react-component-lib';

import type { JSX } from '@wow-design-system/core';

export const WowSignature = /*@__PURE__*/createReactComponent<JSX.WowSignature, HTMLWowSignatureElement>('wow-signature');
```
