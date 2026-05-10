import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { nodeExternals } from 'rollup-plugin-node-externals';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const entries = {
	bundlers: 'src/bundlers/index.ts',
	constants: 'src/constants/index.ts',
	client: 'src/client/index.ts',
	'jsx-runtime': 'src/jsx-runtime.ts',
	transformer: 'src/transformer/index.ts'
};

export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src')
		}
	},
	build: {
		minify: false,
		lib: {
			entry: entries,
			formats: ['es']
		},
		rollupOptions: {
			output: {
				dir: 'dist',
				manualChunks(id) {
					for (const key of Object.keys(entries)) {
						if (id.includes(`/src/${key}/`)) return key;
					}
				}
			}
		}
	},
	plugins: [nodeExternals(), dts({ bundleTypes: true })]
});
