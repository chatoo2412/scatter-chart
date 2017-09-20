module.exports = {
	webpack: {
		host: 'localhost',
		port: 3000,
		devtool: 'source-map',
	},
	client: {
		api: {
			baseUrl: 'http://localhost:3001/',
		},
	},
}
