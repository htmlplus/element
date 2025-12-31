import path from 'node:path';
import { fileURLToPath } from 'node:url';

import alias from '@rollup/plugin-alias';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';
import copy from 'rollup-plugin-copy';
import { dts } from 'rollup-plugin-dts';
import { nodeExternals } from 'rollup-plugin-node-externals';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const input = {
	bundlers: 'src/bundlers/index.ts',
	constants: 'src/constants/index.ts',
	client: 'src/client/index.ts',
	transformer: 'src/transformer/index.ts'
};

const output = {
	dir: 'dist',
	format: 'esm',
	manualChunks(id) {
		for (const key of Object.keys(input)) {
			if (id.includes(`/src/${key}/`)) return key;
		}
	}
};

export default defineConfig([
	{
		input,
		output,
		plugins: [
			nodeExternals(),
			alias({
				entries: [{ find: '@', replacement: path.resolve(__dirname, 'src') }]
			}),
			typescript({ tsconfig: './tsconfig.json' }),
			copy({
				flatten: true,
				targets: [
					{
						dest: output.dir,
						src: 'src/jsx-runtime.d.ts'
					}
				]
			})
		]
	},
	{
		input,
		output,
		plugins: [
			alias({
				entries: [{ find: '@', replacement: path.resolve(__dirname, 'src') }]
			}),
			dts()
		]
	}
]);
