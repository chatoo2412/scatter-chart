module.exports = {
	root: true,
	parserOptions: {
		parser: 'babel-eslint',
		ecmaVersion: 2017,
		sourceType: 'module',
	},
	env: {
		browser: true,
		worker: true,
	},
	extends: [
		'airbnb-base',
	],
	rules: {
		// Own rules
		semi: ['warn', 'never'],
		indent: ['warn', 'tab'],
		'no-tabs': 'off',

		// Minifier-related
		'no-console': 'off',
		'no-unused-vars': ['error', { args: 'none' }],
	},
}
