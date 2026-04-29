import { Element, IsRTL } from '@htmlplus/element';

@Element()
export class MyElement {
	@IsRTL()
	isRTL;

	render() {
		return <div>{this.isRTL.toString()}</div>;
	}
}
