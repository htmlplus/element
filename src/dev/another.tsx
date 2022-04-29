import { Element } from "@htmlplus/element"

@Element()
export class MyAnotherComponent {
    render() {
        <h2>
            <my-text>text</my-text>
            Another component
            <slot/>
        </h2>
    }
}