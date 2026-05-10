import { Element } from '@htmlplus/element';

@Element()
export class MyElement {
	render() {
		return (
			<host value={this} style={{ display: 'block' }}>
				<div style={{ width: '50px' }}></div>
			</host>
		);
	}
}
