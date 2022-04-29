
import {Element } from '@htmlplus/element'

@Element()
export class MyText {
    render() {
        return <div>
            <slot/>
        </div>
    }
}