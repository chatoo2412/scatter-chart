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
	globals: {
		config: true, // Variable passed from webpack
	},
	extends: [
		'airbnb-base',
	],
	settings: {
		'import/resolver': 'webpack',
	},
	rules: {
		// Own rules
		semi: ['warn', 'never'],
		indent: ['warn', 'tab'],
		'no-tabs': 'off',

		// Webpack-related
		'import/no-extraneous-dependencies': ['error', {
			devDependencies: true,
		}],

		// Minifier-related
		'no-console': 'off',
		'no-unused-vars': ['error', { args: 'none' }],
	},
}
