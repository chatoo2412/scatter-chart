const BabelMinifyPlugin = require('babel-minify-webpack-plugin')
const config = require('config')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const pkg = require('./package')
const webpack = require('webpack')

const { host, port, devtool } = config.get('webpack')

const isDev = process.env.NODE_ENV === 'development'

const extractSass = new ExtractTextPlugin({
	disable: isDev,
	filename: '[name].[contenthash].css',
})

const cfg = {
	context: path.resolve(__dirname, './src/'),
	entry: './main.js',
	output: {
		path: path.resolve(__dirname, './dist/'),
		filename: '[name].[chunkhash].js',
	},

	module: {
		rules: [
			{
				enforce: 'pre',
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'eslint-loader',
					options: {
						fix: isDev,
						emitWarning: isDev,
					},
				},
			},
			{
				test: /\.scss$/,
				exclude: /node_modules/,
				use: extractSass.extract({
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							options: {
								sourceMap: true,
							},
						},
						{
							loader: 'sass-loader',
							options: {
								sourceMap: true,
							},
						},
					],
				}),
			},
		],
	},

	resolve: {
		alias: {
			'~': path.resolve(__dirname, './src/'),
		},
	},

	plugins: [
		new webpack.DefinePlugin({
			config: JSON.stringify(config.get('client')),
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
		}),

		new webpack.optimize.ModuleConcatenationPlugin(),

		// Caching
		(isDev ? new webpack.NamedModulesPlugin() : new webpack.HashedModuleIdsPlugin()),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor',
			minChunks: module => (module.context && module.context.includes('node_modules')),
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'manifest',
			minChunks: Infinity,
		}),

		new HtmlWebpackPlugin({
			template: './index.html',
			minify: isDev ? undefined : {
				removeComments: true,
				collapseWhitespace: true,
				conservativeCollapse: true,
			},
		}),

		extractSass,

		new webpack.BannerPlugin({
			banner: `
${pkg.name} v${pkg.version}
author : ${pkg.author}
license: ${pkg.license}
			`.trim(),
		}),
	],

	devServer: {
		host,
		port,
	},

	devtool,
}

if (!isDev) {
	cfg.plugins.push(new BabelMinifyPlugin({
		removeConsole: true,
	}))
}

module.exports = cfg
