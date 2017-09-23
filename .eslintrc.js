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
	settings: {
		'import/resolver': 'webpack',
	},
	rules: {
		// Own rules
		semi: ['warn', 'never'],
		indent: ['warn', 'tab', {
			SwitchCase: 1,
			VariableDeclarator: 1,
			outerIIFEBody: 1,
			FunctionDeclaration: {
				parameters: 1,
				body: 1,
			},
			FunctionExpression: {
				parameters: 1,
				body: 1,
			},
			CallExpression: {
				arguments: 1,
			},
			ArrayExpression: 1,
			ObjectExpression: 1,
			ImportDeclaration: 1,
			flatTernaryExpressions: false,
		}],
		'max-len': 'off',
		'no-tabs': 'off',
		'import/prefer-default-export': 'off',

		// Webpack-related
		'import/no-extraneous-dependencies': ['error', {
			devDependencies: true,
		}],

		// Minifier-related
		'no-console': 'off',
		'no-unused-vars': ['error', { args: 'none' }],
	},
}
