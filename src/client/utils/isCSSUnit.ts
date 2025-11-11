export const isCSSUnit = (input: string): boolean => {
	return /^\d+(\.\d+)?(px|pt|cm|mm|in|em|rem|%|vw|vh)$/.test(input);
};
