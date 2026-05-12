export default {
	'*.{js,jsx,ts,tsx,json,css,html}': () => [
		'biome format --write',
		'biome check --error-on-warnings'
	],
	'*.{ts,tsx}': (files) => [
		'npm run type-check',
		`vitest --config tests/vitest.config.ts run --passWithNoTests --browser.headless ${files.join(' ')}`
	],
	'package.json': () => 'npx --yes sort-package-json'
};
