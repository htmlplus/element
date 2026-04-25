import { Element, Style } from '@htmlplus/element';

const styleAsString = (key: string) => `:host { #${key} { font-size: 20px; }}`

var styleAsObject = (key: string) => ({
	':host': {
		[`#${key}`]: {
			'fontSize': '20px'
		}
	}
})

var styleAsArray = (key: string) => ([styleAsString(key), styleAsObject(key)])

@Element()
export class MyElement {
	/**
	 * PROPERTIES
	 */

	@Style()
	propertyString = styleAsString('property-string');

	@Style()
	propertyObject = styleAsObject('property-object');

	@Style()
	propertyArray = styleAsArray('property-array');

	/**
	 * GETTERS
	 */

	@Style()
	get getterString() {
		return styleAsString('getter-string');
	}

	@Style()
	get getterObject() {
		return styleAsObject('getter-object');
	}

	@Style()
	get getterArray() {
		return styleAsArray('getter-array');
	}

	/**
	 * METHODS
	 */

	@Style()
	methodString() {
		return styleAsString('method-string');
	}

	@Style()
	methodObject() {
		return styleAsObject('method-object');
	}

	@Style()
	methodArray() {
		return styleAsArray('method-array');
	}

	/**
	 * ASYNC
	 */

	@Style()
	async asyncString() {
		return await styleAsString('async-string');
	}

	@Style()
	async asyncObject() {
		return await styleAsObject('async-object');
	}

	@Style()
  async asyncArray() {
		return await styleAsArray('async-array');
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
			</div>
		);
	}
}
