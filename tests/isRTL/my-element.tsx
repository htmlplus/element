import { Element, IsRTL } from '@htmlplus/element';

@Element()
export class MyElement {
	@IsRTL()
	direction;

	render() {
		return <div>{this.direction}</div>;
	}
}
