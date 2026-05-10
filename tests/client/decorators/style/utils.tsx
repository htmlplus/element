export const styleAsString = (key: string, offset: number) =>
	`:host { #${key} { font-size: ${20 + offset}px; }}`;

export const styleAsObject = (key: string, offset: number) => ({
	':host': {
		[`#${key}`]: {
			fontSize: `${20 + offset}px`
		}
	}
});

export const styleAsArray = (key: string, offset: number) => [
	styleAsString(key, offset),
	styleAsObject(key, offset)
];
