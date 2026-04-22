import { Element } from '@htmlplus/element';

@Element()
export class MyElement {
	static style = '#scoped-style-text { font-size: 16px }';

	render() {
		return (
			<host style={{ fontSize: '15px' }}>
				<p id="inherited-text"></p>
				<p id="scoped-style-text"></p>
				<p id="inline-override-text" style={{ fontSize: '17px' }}></p>
			</host>
		);
	}
}
