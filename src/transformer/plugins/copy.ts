import path from 'node:path';

import fs from 'fs-extra';

import type { InvertOptional, TransformerPlugin } from '../transformer.types';

export const COPY_OPTIONS: InvertOptional<CopyOptions> = {
	at: 'start',
	transformer: (content) => content
};

export interface CopyOptions {
	at?: 'start' | 'run' | 'finish';
	destination: string;
	source: string;
	transformer?: (content: string) => string;
}

export const copy = (userOptions: CopyOptions): TransformerPlugin => {
	const name = 'copy';

	const options = Object.assign({}, COPY_OPTIONS, userOptions) as Required<CopyOptions>;

	const copy = (caller) => {
		if (options.at !== caller) return;

		let content = fs.readFileSync(options.source, 'utf8');

		if (options.transformer) content = options.transformer(content);

		fs.ensureDirSync(path.dirname(options.destination));

		fs.writeFileSync(options.destination, content, 'utf8');
	};

	const start = () => {
		copy('start');
	};

	const run = () => {
		copy('run');
	};

	const finish = () => {
		copy('finish');
	};

	return { name, start, run, finish };
};
