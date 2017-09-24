module.exports = {
	webpack: {
		host: '0.0.0.0',
		port: 3000,
		devtool: 'source-map',
	},
	client: {
		api: {
			baseUrl: 'http://localhost:3001/',
		},
	},
}
