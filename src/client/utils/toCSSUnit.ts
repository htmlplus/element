export const toCSSUnit = (input?: number | string | null): string | undefined => {
	if (input === undefined || input === null || input === '') {
		return;
	}

	if (typeof input === 'number' || (typeof input === 'string' && !Number.isNaN(Number(input)))) {
		return `${input}px`;
	}

	if (/^\d+(\.\d+)?(px|pt|cm|mm|in|em|rem|%|vw|vh)$/.test(input)) {
		return input;
	}
};
