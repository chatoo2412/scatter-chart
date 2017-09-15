module.exports = {
	webpack: {
		host: 'localhost',
		port: 3000,
		devtool: 'source-map',
	},
	client: {
		axios: {
			baseUrl: 'http://localhost:3001/',
		},
	},
}
