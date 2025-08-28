import { isCSSColor } from './isCSSColor';

export const toCSSColor = (input: string): string | undefined => {
	return isCSSColor(input) ? input : undefined;
};
