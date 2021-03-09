const webpack = require('webpack');
const path = require('path');
const { resolve } = require('path');
const { readFileSync, existsSync } = require('fs');
const { isInstalledVersionPreactXOrAbove } = require('./utils');
const autoprefixer = require('autoprefixer');
const browserslist = require('browserslist');
const requireRelative = require('require-relative');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const ReplacePlugin = require('webpack-plugin-replace');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const createBabelConfig = require('../babel-config');
const loadPostcssConfig = require('postcss-load-config');

function readJson(file) {
	try {
		return JSON.parse(readFileSync(file));
	} catch (e) {}
}

// attempt to resolve a dependency, giving $CWD/node_modules priority:
// function resolveDep(dep, cwd) {
// 	try {
// 		return requireRelative.resolve(dep, cwd || process.cwd());
// 	} catch (e) {}
// 	try {
// 		return require.resolve(dep);
// 	} catch (e) {}
// 	return dep;
// }

function findAllNodeModules(startDir) {
	let dir = path.resolve(startDir);
	let dirs = [];
	const { root } = path.parse(startDir);

	// eslint-disable-next-line no-constant-condition
	while (true) {
		const joined = path.join(dir, 'node_modules');
		if (existsSync(joined)) {
			dirs.push(joined);
		}
		if (dir === root) {
			return dirs;
		}
		dir = path.dirname(dir);
	}
}

function resolveTsconfig(cwd, isProd) {
	if (existsSync(resolve(cwd, `tsconfig.${isProd ? 'prod' : 'dev'}.json`))) {
		return resolve(cwd, `tsconfig.${isProd ? 'prod' : 'dev'}.json`);
	} else if (existsSync(resolve(cwd, 'tsconfig.json'))) {
		return resolve(cwd, 'tsconfig.json');
	}
}

function getSassConfiguration(...includePaths) {
	const config = {
		sourceMap: true,
		sassOptions: {
			includePaths,
		},
	};

	Object.defineProperty(config, 'includePaths', { value: includePaths });

	return config;
}

module.exports = function (env) {
	const { cwd, isProd, isWatch, src, source } = env;
	const babelConfigFile = env.babelConfig || '.babelrc';
	const IS_SOURCE_PREACT_X_OR_ABOVE = isInstalledVersionPreactXOrAbove(cwd);
	// Apply base-level `env` values
	env.dest = resolve(cwd, env.dest || 'build');
	env.manifest = readJson(source('manifest.json')) || {};
	env.pkg = readJson(resolve(cwd, 'package.json')) || {};

	let babelrc = readJson(resolve(cwd, babelConfigFile)) || {};

	// use browserslist config environment, config default, or default browsers
	// default browsers are > 0.25% global market share or Internet Explorer >= 9
	const browserslistDefaults = ['> 0.25%', 'IE >= 9'];
	const browserlistConfig = Object(browserslist.findConfig(cwd));
	const browsers =
		(isProd ? browserlistConfig.production : browserlistConfig.development) ||
		browserlistConfig.defaults ||
		browserslistDefaults;

	let userNodeModules = findAllNodeModules(cwd);
	let cliNodeModules = findAllNodeModules(__dirname);
	let nodeModules = [...new Set([...userNodeModules, ...cliNodeModules])];

	let compat = 'preact-compat';
	try {
		requireRelative.resolve('preact/compat', cwd);
		compat = 'preact/compat';
	} catch (e) {}

	let tsconfig = resolveTsconfig(cwd, isProd);

	let postcssPlugins;

	try {
		postcssPlugins = loadPostcssConfig.sync(cwd).plugins;
	} catch (error) {
		postcssPlugins = [autoprefixer({ overrideBrowserslist: browsers })];
	}

	return {
		context: src,

		resolve: {
			modules: [...nodeModules, 'node_modules'],
			extensions: [
				'.mjs',
				'.js',
				'.jsx',
				'.ts',
				'.tsx',
				'.json',
				'.less',
				'.pcss',
				'.scss',
				'.sass',
				'.styl',
				'.css',
				'.wasm',
			],
			alias: Object.assign(
				{
					style: source('style'),
					'preact-cli-entrypoint': source('index'),
					url: 'native-url',
					// preact-compat aliases for supporting React dependencies:
					react: compat,
					'react-dom': compat,
					'react-addons-css-transition-group': 'preact-css-transition-group',
					'preact-cli/async-component': IS_SOURCE_PREACT_X_OR_ABOVE
						? require.resolve('@preact/async-loader/async')
						: require.resolve('@preact/async-loader/async-legacy'),
				},
				compat !== 'preact-compat' ? { 'preact-compat': compat } : {}
			),
		},

		resolveLoader: {
			modules: [...nodeModules],
			alias: {
				'proxy-loader': require.resolve('./proxy-loader'),
			},
		},

		module: {
			rules: [
				{
					// ES2015
					enforce: 'pre',
					test: /\.m?[jt]sx?$/,
					resolve: { mainFields: ['module', 'jsnext:main', 'browser', 'main'] },
					type: 'javascript/auto',
					loader: 'babel-loader',
					options: Object.assign(
						{ babelrc: false },
						createBabelConfig(env, { browsers }),
						babelrc // intentionally overwrite our settings
					),
				},
				{
					// LESS
					enforce: 'pre',
					test: /\.less$/,
					use: [
						{
							loader: 'proxy-loader',
							options: {
								cwd,
								loader: 'less-loader',
								options: {
									sourceMap: true,
									lessOptions: {
										paths: [...nodeModules],
									},
								},
							},
						},
					],
				},
				{
					// SASS
					enforce: 'pre',
					test: /\.s[ac]ss$/,
					use: [
						{
							loader: 'proxy-loader',
							options: {
								cwd,
								loader: 'sass-loader',
								options: getSassConfiguration(...nodeModules),
							},
						},
					],
				},
				{
					// STYLUS
					enforce: 'pre',
					test: /\.styl$/,
					use: [
						{
							loader: 'proxy-loader',
							options: {
								cwd,
								loader: 'stylus-loader',
								options: {
									sourceMap: true,
									paths: nodeModules,
								},
							},
						},
					],
				},
				{
					// User styles
					test: /\.(p?css|less|s[ac]ss|styl)$/,
					include: [source('components'), source('routes')],
					use: [
						isWatch ? 'style-loader' : MiniCssExtractPlugin.loader,
						{
							loader: 'css-loader',
							options: {
								modules: {
									localIdentName: '[local]__[hash:base64:5]',
								},
								importLoaders: 1,
								sourceMap: true,
							},
						},
						{
							loader: 'postcss-loader',
							options: {
								ident: 'postcss',
								sourceMap: true,
								plugins: postcssPlugins,
							},
						},
					],
				},
				{
					// External / `node_module` styles
					test: /\.(p?css|less|s[ac]ss|styl)$/,
					exclude: [source('components'), source('routes')],
					use: [
						isWatch ? 'style-loader' : MiniCssExtractPlugin.loader,
						{
							loader: 'css-loader',
							options: {
								sourceMap: true,
							},
						},
						{
							loader: 'postcss-loader',
							options: {
								ident: 'postcss',
								sourceMap: true,
								plugins: postcssPlugins,
							},
						},
					],
					// Don't consider CSS imports dead code even if the
					// containing package claims to have no side effects.
					// Remove this when webpack adds a warning or an error for this.
					// See https://github.com/webpack/webpack/issues/6571
					sideEffects: true,
				},
				{
					test: /\.(xml|html|txt|md)$/,
					loader: 'raw-loader',
				},
				{
					test: /\.(svg|woff2?|ttf|eot|jpe?g|png|webp|gif|mp4|mov|ogg|webm)(\?.*)?$/i,
					loader: isProd ? 'file-loader' : 'url-loader',
				},
			],
		},

		plugins: [
			new webpack.NoEmitOnErrorsPlugin(),
			new webpack.DefinePlugin({
				'process.env.NODE_ENV': JSON.stringify(
					isProd ? 'production' : 'development'
				),
			}),
			new webpack.ProvidePlugin({
				h: ['preact', 'h'],
				Fragment: ['preact', 'Fragment'],
			}),
			// Fix for https://github.com/webpack-contrib/mini-css-extract-plugin/issues/151
			new FixStyleOnlyEntriesPlugin(),
			// Extract CSS
			new MiniCssExtractPlugin({
				filename: isProd ? '[name].[contenthash:5].css' : '[name].css',
				chunkFilename: isProd
					? '[name].chunk.[contenthash:5].css'
					: '[name].chunk.css',
			}),
			new ProgressBarPlugin({
				format:
					'\u001b[97m\u001b[44m Build \u001b[49m\u001b[39m [:bar] \u001b[32m\u001b[1m:percent\u001b[22m\u001b[39m (:elapseds) \u001b[2m:msg\u001b[22m',
				renderThrottle: 100,
				summary: false,
				clear: true,
			}),
			...(tsconfig
				? [
						new ForkTsCheckerWebpackPlugin({
							checkSyntacticErrors: true,
							async: !isProd,
							tsconfig: tsconfig,
							silent: !isWatch,
						}),
				  ]
				: []),
			...(isProd
				? [
						new webpack.HashedModuleIdsPlugin(),
						new webpack.LoaderOptionsPlugin({ minimize: true }),
						new webpack.optimize.ModuleConcatenationPlugin(),

						// strip out babel-helper invariant checks
						new ReplacePlugin({
							include: /babel-helper$/,
							patterns: [
								{
									regex: /throw\s+(new\s+)?(Type|Reference)?Error\s*\(/g,
									value: s => `return;${Array(s.length - 7).join(' ')}(`,
								},
							],
						}),
				  ]
				: []),
		],

		optimization: {
			splitChunks: {
				minChunks: 3,
			},
		},

		mode: isProd ? 'production' : 'development',

		devtool: isWatch ? 'cheap-module-eval-source-map' : 'source-map',

		node: {
			console: false,
			process: false,
			Buffer: false,
			__filename: false,
			__dirname: false,
			setImmediate: false,
		},
	};
};

module.exports.readJson = readJson;
