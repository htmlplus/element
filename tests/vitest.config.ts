import path from 'node:path';

import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

import { vite as htmlplus } from '../dist/bundlers';

export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve(__dirname, '../src'),
			'@htmlplus/element/jsx-dev-runtime': path.resolve(__dirname, '../src/jsx-runtime.ts'),
			'@htmlplus/element': path.resolve(__dirname, '../src/client')
		}
	},
	plugins: [htmlplus()],
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
