const webpack = require('webpack');
const { resolve, join } = require('path');
const { existsSync } = require('fs');
const { isInstalledVersionPreactXOrAbove } = require('./utils');
const merge = require('webpack-merge');
const { filter } = require('minimatch');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CrittersPlugin = require('critters-webpack-plugin');
const renderHTMLPlugin = require('./render-html-plugin');
const PushManifestPlugin = require('./push-manifest');
const baseConfig = require('./webpack-base-config');
const BabelEsmPlugin = require('babel-esm-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const RefreshPlugin = require('@prefresh/webpack');
const { normalizePath, warn } = require('../../util');

const cleanFilename = (name) =>
	name.replace(
		/(^\/(routes|components\/(routes|async))\/|(\/index)?\.js$)/g,
		''
	);

async function clientConfig(env) {
	const { isProd, source, src, cwd /*, port? */ } = env;
	const IS_SOURCE_PREACT_X_OR_ABOVE = isInstalledVersionPreactXOrAbove(cwd);
	const asyncLoader = IS_SOURCE_PREACT_X_OR_ABOVE
		? require.resolve('@preact/async-loader')
		: require.resolve('@preact/async-loader/legacy');

	let entry = {
		bundle: resolve(__dirname, './../entry'),
		polyfills: resolve(__dirname, './polyfills'),
	};

	return {
		entry: entry,
		output: {
			path: env.dest,
			publicPath: '/',
			filename: isProd ? '[name].[chunkhash:5].js' : '[name].js',
			chunkFilename: '[name].chunk.[chunkhash:5].js',
		},

		resolveLoader: {
			alias: {
				async: asyncLoader,
			},
		},

		// automatic async components :)
		module: {
			rules: [
				{
					test: /\.[jt]sx?$/,
					include: [
						filter(source('routes') + '/{*,*/index}.{js,jsx,ts,tsx}'),
						filter(
							source('components') +
								'/{routes,async}/{*,*/index}.{js,jsx,ts,tsx}'
						),
					],
					loader: asyncLoader,
					options: {
						name(filename) {
							filename = normalizePath(filename);
							let relative = filename.replace(normalizePath(src), '');
							if (!relative.includes('/routes/')) return false;
							return 'route-' + cleanFilename(relative);
						},
						formatName(filename) {
							filename = normalizePath(filename);
							let relative = filename.replace(normalizePath(source('.')), '');
							return cleanFilename(relative);
						},
					},
				},
			],
		},

		plugins: [
			new PushManifestPlugin(env),
			...(await renderHTMLPlugin(env)),
			...getBabelEsmPlugin(env),
			new CopyWebpackPlugin(
				[
					existsSync(source('manifest.json')) && { from: 'manifest.json' },
					// copy any static files
					existsSync(source('assets')) && { from: 'assets', to: 'assets' },
					// copy sw-debug
					{
						from: resolve(__dirname, '../../resources/sw-debug.js'),
						to: 'sw-debug.js',
					},
					// copy files from static to build directory
					existsSync(source('static')) && {
						from: resolve(source('static')),
						to: '.',
					},
				].filter(Boolean)
			),
		],
	};
}

function getBabelEsmPlugin(config) {
	const esmPlugins = [];
	if (config.esm) {
		esmPlugins.push(
			new BabelEsmPlugin({
				filename: config.isProd
					? '[name].[chunkhash:5].esm.js'
					: '[name].esm.js',
				chunkFilename: '[name].chunk.[chunkhash:5].esm.js',
				excludedPlugins: ['BabelEsmPlugin', 'InjectManifest'],
				beforeStartExecution: (plugins) => {
					plugins.forEach((plugin) => {
						if (
							plugin.constructor.name === 'DefinePlugin' &&
							plugin.definitions
						) {
							for (const definition in plugin.definitions) {
								if (definition === 'process.env.ES_BUILD') {
									plugin.definitions[definition] = true;
								}
							}
						} else if (
							plugin.constructor.name === 'DefinePlugin' &&
							!plugin.definitions
						) {
							throw new Error(
								'WebpackDefinePlugin found but not `process.env.ES_BUILD`.'
							);
						}
					});
				},
			})
		);
	}
	return esmPlugins;
}

function isProd(config) {
	let limit = 200 * 1000; // 200kb
	const { src, sw } = config;
	let swPath;
	if (sw) {
		swPath = join(__dirname, '..', '..', '..', 'sw', 'sw.js');
		const userSwPath = join(src, 'sw.js');
		if (existsSync(userSwPath)) {
			swPath = userSwPath;
		} else {
			warn(`Could not find sw.js in ${src}. Using the default service worker.`);
		}
	}
	const prodConfig = {
		performance: Object.assign(
			{
				hints: 'warning',
				maxAssetSize: limit,
				maxEntrypointSize: limit,
			},
			config.pkg.performance
		),

		plugins: [
			new webpack.DefinePlugin({
				'process.env.ADD_SW': config.sw,
				'process.env.ES_BUILD': false,
				'process.env.ESM': config.esm,
				'process.env.PRERENDER': config.prerender,
			}),
		],

		optimization: {
			minimizer: [
				new TerserPlugin({
					cache: true,
					parallel: true,
					terserOptions: {
						output: { comments: false },
						mangle: true,
						compress: {
							keep_fargs: false,
							pure_getters: true,
							hoist_funs: true,
							pure_funcs: [
								'classCallCheck',
								'_classCallCheck',
								'_possibleConstructorReturn',
								'Object.freeze',
								'invariant',
								'warning',
							],
						},
					},
					extractComments: false,
					sourceMap: true,
				}),
				new OptimizeCssAssetsPlugin({
					cssProcessorOptions: {
						// Fix keyframes in different CSS chunks minifying to colliding names:
						reduceIdents: false,
					},
				}),
			],
		},
	};

	if (config.esm && config.sw) {
		prodConfig.plugins.push(
			new InjectManifest({
				swSrc: swPath,
				swDest: 'sw-esm.js',
				include: [
					/^\/?index\.html$/,
					/\.esm.js$/,
					/\.css$/,
					/\.(png|jpg|svg|gif|webp)$/,
				],
				webpackCompilationPlugins: [
					new webpack.DefinePlugin({
						'process.env.ESM': true,
					}),
				],
			})
		);
	}

	if (config.sw) {
		prodConfig.plugins.push(
			new InjectManifest({
				swSrc: swPath,
				include: [
					/index\.html$/,
					/\.js$/,
					/\.css$/,
					/\.(png|jpg|svg|gif|webp)$/,
				],
				exclude: [/\.esm\.js$/],
			})
		);
	}

	if (config['inline-css']) {
		prodConfig.plugins.push(
			new CrittersPlugin({
				preload: 'media',
				pruneSource: false,
				logLevel: 'silent',
				additionalStylesheets: ['*.css'],
			})
		);
	}

	if (config.analyze) {
		prodConfig.plugins.push(new BundleAnalyzerPlugin());
	}

	if (config.brotli) {
		prodConfig.plugins.push(
			new CompressionPlugin({
				filename: '[path].br[query]',
				algorithm: 'brotliCompress',
				test: /\.esm\.js$/,
			})
		);
	}

	return prodConfig;
}

function isDev(config) {
	const { cwd, src, refresh } = config;

	return {
		plugins: [
			new webpack.NamedModulesPlugin(),
			new webpack.HotModuleReplacementPlugin(),
			...(refresh ? [new RefreshPlugin()] : []),
			new webpack.DefinePlugin({
				'process.env.ADD_SW': config.sw,
				'process.env.PRERENDER': config.prerender,
			}),
		],

		devServer: {
			inline: true,
			hot: true,
			compress: true,
			publicPath: '/',
			contentBase: src,
			https: config.https,
			port: process.env.PORT || config.port || 8080,
			host: process.env.HOST || config.host || '0.0.0.0',
			disableHostCheck: true,
			historyApiFallback: true,
			quiet: true,
			clientLogLevel: 'none',
			overlay: false,
			stats: 'minimal',
			watchOptions: {
				ignored: [resolve(cwd, 'build'), resolve(cwd, 'node_modules')],
			},
		},
	};
}

module.exports = async function (env) {
	return merge(
		baseConfig(env),
		await clientConfig(env),
		(env.isProd ? isProd : isDev)(env)
	);
};
