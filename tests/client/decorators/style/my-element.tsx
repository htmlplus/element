import { Element, State, Style } from '@htmlplus/element';

import { styleAsArray, styleAsObject, styleAsString } from './utils';

@Element()
export class MyElement {
	@State()
	offset: number = 0;

	/**
	 * PROPERTIES
	 */

	@Style()
	propertyString = styleAsString('property-string', this.offset);

	@Style()
	propertyObject = styleAsObject('property-object', this.offset);

	@Style()
	propertyArray = styleAsArray('property-array', this.offset);

	/**
	 * GETTERS
	 */

	@Style()
	get getterString() {
		return styleAsString('getter-string', this.offset);
	}

	@Style()
	get getterObject() {
		return styleAsObject('getter-object', this.offset);
	}

	@Style()
	get getterArray() {
		return styleAsArray('getter-array', this.offset);
	}

	/**
	 * METHODS
	 */

	@Style()
	methodString() {
		return styleAsString('method-string', this.offset);
	}

	@Style()
	methodObject() {
		return styleAsObject('method-object', this.offset);
	}

	@Style()
	methodArray() {
		return styleAsArray('method-array', this.offset);
	}

	/**
	 * ASYNC
	 */

	@Style()
	async asyncString() {
		return await styleAsString('async-string', this.offset);
	}

	@Style()
	async asyncObject() {
		return await styleAsObject('async-object', this.offset);
	}

	@Style()
	async asyncArray() {
		return await styleAsArray('async-array', this.offset);
	}

	render() {
		return (
			<div>
				{/* PROPERTIES */}
				<div id="property-string"></div>
				<div id="property-object"></div>
				<div id="property-array"></div>

				{/* GETTERS */}
				<div id="getter-string"></div>
				<div id="getter-object"></div>
				<div id="getter-array"></div>

				{/* METHODS */}
				<div id="method-string"></div>
				<div id="method-object"></div>
				<div id="method-array"></div>

				{/* ASYNC */}
				<div id="async-string"></div>
				<div id="async-object"></div>
				<div id="async-array"></div>

				<button type="button" onClick={() => this.offset++}>
					update
				</button>
			</div>
		);
	}
}
