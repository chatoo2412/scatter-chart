const BabelMinifyPlugin = require('babel-minify-webpack-plugin')
const config = require('config')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const path = require('path')
const webpack = require('webpack')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const pkg = require('./package')

const { host, port, devtool } = config.get('webpack')

const isDev = process.env.NODE_ENV === 'development'

const extractSass = new ExtractTextPlugin({
	disable: isDev,
	filename: '[name].[contenthash].css',
})

const cfg = {
	context: path.resolve(__dirname, './src/'),
	entry: './entry.js',
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
				test: /\.js$/,
				exclude: /node_modules/,
				use: 'babel-loader',
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
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
			'process.env.CONFIG': JSON.stringify(config.get('client')),
		}),

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

		// Optimizing
		new webpack.optimize.ModuleConcatenationPlugin(),
		new LodashModuleReplacementPlugin(),
		new webpack.ContextReplacementPlugin(
			/moment[/\\]locale$/,
			/ko/,
		),
		new BundleAnalyzerPlugin({
			analyzerMode: isDev ? 'server' : 'static',
			openAnalyzer: !isDev,
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
