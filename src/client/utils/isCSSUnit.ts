export const isCSSUnit = (input: string): boolean => {
	const option = new Option();

	option.style.width = input;

	return option.style.width !== '';
};
