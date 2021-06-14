const ip = require('ip');
const webpack = require('webpack');
const getPort = require('get-port');
const { resolve } = require('path');
const clear = require('console-clear');
const { writeFile } = require('fs').promises;
const { bold, red, green, magenta } = require('kleur');
const DevServer = require('webpack-dev-server');
const clientConfig = require('./webpack-client-config');
const serverConfig = require('./webpack-server-config');
const transformConfig = require('./transform-config');
const { error, isDir, warn } = require('../../util');
const { devServerRunning } = require('./hooks');

async function devBuild(env) {
	let userPort = parseInt(process.env.PORT || env.port, 10) || 8080;
	env.port = await getPort({ port: userPort });

	let config = await clientConfig(env);

	await transformConfig(env, config);

	let port = config.devServer.port;

	let compiler = webpack(config);
	return new Promise((res, rej) => {
		compiler.hooks.emit.tapAsync('CliDevPlugin', (compilation, callback) => {
			let missingDeps = compilation.missingDependencies;
			let nodeModulesPath = resolve(__dirname, '../../../node_modules');

			// ...tell webpack to watch node_modules recursively until they appear.
			if (
				Array.from(missingDeps).some(
					file => file.indexOf(nodeModulesPath) !== -1
				)
			) {
				compilation.contextDependencies.push(nodeModulesPath);
			}

			callback();
		});

		compiler.hooks.done.tap('CliDevPlugin', stats => {
			let devServer = config.devServer;
			let protocol = process.env.HTTPS || devServer.https ? 'https' : 'http';
			let host = process.env.HOST || devServer.host || 'localhost';
			if (host === '0.0.0.0' && process.platform === 'win32') {
				host = 'localhost';
			}

			let serverAddr = `${protocol}://${host}:${bold(port)}`;
			let localIpAddr = `${protocol}://${ip.address()}:${bold(port)}`;

			if (env['clear']) clear(true);

			if (stats.hasErrors()) {
				process.stdout.write(red('Build failed!\n\n'));
			} else {
				process.stdout.write(green('Compiled successfully!\n\n'));

				if (userPort !== port) {
					process.stdout.write(
						`Port ${bold(userPort)} is in use, using ${bold(port)} instead\n\n`
					);
				}
				process.stdout.write('You can view the application in browser.\n\n');
				process.stdout.write(`${bold('Local:')}            ${serverAddr}\n`);
				process.stdout.write(`${bold('On Your Network:')}  ${localIpAddr}\n`);
			}

			showStats(stats, false);
			devServerRunning.call();
		});

		compiler.hooks.failed.tap('CliDevPlugin', rej);

		let c = Object.assign({}, config.devServer, {
			stats: { colors: true },
		});

		let server = new DevServer(compiler, c);
		server.listen(port);
		res(server);
	});
}

async function prodBuild(env) {
	let config = await clientConfig(env);
	await transformConfig(env, config);

	if (env.prerender) {
		let ssrConfig = serverConfig(env);
		await transformConfig(env, ssrConfig, true);
		let serverCompiler = webpack(ssrConfig);
		await runCompiler(serverCompiler);
	}

	let clientCompiler = webpack(config);

	try {
		let stats = await runCompiler(clientCompiler);

		// Timeout for plugins that work on `after-emit` event of webpack
		await new Promise(r => setTimeout(r, 20));

		return showStats(stats, true);
	} catch (err) {
		// eslint-disable-next-line
		console.log(err);
	}
}

function runCompiler(compiler) {
	return new Promise((res, rej) => {
		compiler.run((err, stats) => {
			showStats(stats, true);

			if (err || (stats && stats.hasErrors())) {
				rej(`${red('\n\nBuild failed! \n\n')} ${err || ''}`);
			}

			res(stats);
		});
	});
}

function showStats(stats, isProd) {
	if (stats) {
		if (stats.hasErrors()) {
			allFields(stats, 'errors')
				.map(stripLoaderPrefix)
				.forEach(msg => error(msg, isProd ? 1 : 0));
		}

		if (stats.hasWarnings()) {
			allFields(stats, 'warnings')
				.map(stripLoaderPrefix)
				.forEach(msg => {
					if (
						msg.match(
							/Conflict: Multiple assets emit different content to the same filename .*\.(css|map)/
						)
					) {
						/**
						 * This particular warning is expected due to `babel-esm-plugin`.
						 * This can be removed when upgrading to webpack5 with https://webpack.js.org/configuration/output/#outputcomparebeforeemit
						 */
						return;
					}
					warn(msg);
				});
		}
	}

	return stats;
}

function writeJsonStats(stats) {
	let outputPath = resolve(process.cwd(), 'stats.json');
	let jsonStats = stats.toJson({
		json: true,
		chunkModules: true,
		source: false,
	});

	function strip(stats) {
		stats.modules.forEach(stripLoaderFromModuleNames);
		stats.chunks.forEach(c => {
			(
				c.modules ||
				(c.mapModules != null ? c.mapModules(Object) : c.getModules())
			).forEach(stripLoaderFromModuleNames);
		});
		if (stats.children) stats.children.forEach(strip);
	}

	strip(jsonStats);

	return writeFile(outputPath, JSON.stringify(jsonStats)).then(() => {
		process.stdout.write('\nWebpack output stats generated.\n\n');
		process.stdout.write('You can upload your stats.json to:\n');
		process.stdout.write(
			'- https://chrisbateman.github.io/webpack-visualizer/\n'
		);
		process.stdout.write('- https://webpack.github.io/analyse/\n');
	});
}

function allFields(stats, field, fields = [], name = null) {
	const info = stats.toJson({
		errors: true,
		warnings: false,
		errorDetails: false,
	});
	const addCompilerPrefix = msg =>
		name ? bold(magenta(name + ': ')) + msg : msg;
	if (field === 'errors' && stats.hasErrors()) {
		fields = fields.concat(info.errors.map(addCompilerPrefix));
	}
	if (field === 'warnings' && stats.hasWarnings()) {
		fields = fields.concat(info.warnings.map(addCompilerPrefix));
	}
	if (stats.compilation.children) {
		stats.compilation.children.forEach((child, index) => {
			const name = child.name || `Child Compiler ${index + 1}`;
			const stats = child.getStats();
			fields = allFields(stats, field, fields, name);
		});
	}
	return fields;
}

const keysToNormalize = [
	'issuer',
	'issuerName',
	'identifier',
	'name',
	'module',
	'moduleName',
	'moduleIdentifier',
];

/** Removes all loaders from any resource identifiers found in a string */
function stripLoaderPrefix(str) {
	if (typeof str === 'string') {
		str = str.replace(
			/(?:(\()|(^|\b|@))(\.\/~|\.{0,2}\/(?:[^\s]+\/)?node_modules)\/\w+-loader(\/[^?!]+)?(\?\?[\w_.-]+|\?({[\s\S]*?})?)?!/g,
			'$1'
		);
		str = str.replace(/(\.?\.?(?:\/[^/ ]+)+)\s+\(\1\)/g, '$1');
		str = replaceAll(str, process.cwd(), '.');
		return str;
	}
	return str;
}

// https://gist.github.com/developit/1a40a6fee65361d1182aaa22ab8c334c
function replaceAll(str, find, replace) {
	let s = '',
		index,
		next;
	while (~(next = str.indexOf(find, index))) {
		s += str.substring(index, next) + replace;
		index = next + find.length;
	}
	return s + str.substring(index);
}

function stripLoaderFromModuleNames(m) {
	for (let key in m) {
		if (
			Object.prototype.hasOwnProperty.call(m, key) &&
			m[key] != null &&
			~keysToNormalize.indexOf(key)
		) {
			m[key] = stripLoaderPrefix(m[key]);
		}
	}

	if (m.reasons) {
		m.reasons.forEach(stripLoaderFromModuleNames);
	}

	return m;
}

module.exports = function (env, watch = false) {
	env.isProd = env.production; // shorthand
	env.isWatch = !!watch; // use HMR?
	env.cwd = resolve(env.cwd || process.cwd());

	// env.src='src' via `build` default
	let src = resolve(env.cwd, env.src);
	env.src = isDir(src) ? src : env.cwd;

	// attach sourcing helper
	env.source = dir => resolve(env.src, dir);

	// determine build-type to run
	return (watch ? devBuild : prodBuild)(env);
};

module.exports.writeJsonStats = writeJsonStats;
