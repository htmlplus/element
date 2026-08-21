import path from 'node:path';

import { defineConfig } from 'vite';

import { vite as htmlplus } from '../dist/bundlers';

export default defineConfig({
	server: {
		open: '/development/index.html',
		port: 3500
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, '../src'),
			'@htmlplus/element/jsx-dev-runtime': path.resolve(__dirname, '../src/jsx-runtime.ts'),
			'@htmlplus/element': path.resolve(__dirname, '../src/client')
		}
	},
	plugins: [htmlplus()]
});
