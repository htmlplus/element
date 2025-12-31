import path from 'node:path';

import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

import { vite as htmlplus } from '../dist/bundlers';
import { customElement, extract, parse, read, style, validate } from '../dist/transformer';

export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve(__dirname, '../src'),
			'@htmlplus/element': path.resolve(__dirname, '../src/client')
		}
	},
	plugins: [htmlplus(read(), parse(), validate(), extract(), style(), customElement())],
	test: {
		globals: true,
		setupFiles: path.resolve(__dirname, './vitest.setup.ts'),
		browser: {
			enabled: true,
			provider: playwright(),
			instances: [
				{
					name: 'chromium',
					browser: 'chromium'
				}
			]
		}
	}
});
