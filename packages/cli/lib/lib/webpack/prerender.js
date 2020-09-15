const { red, yellow } = require('kleur');
const { resolve } = require('path');
const { readFileSync } = require('fs');
const stackTrace = require('stack-trace');
const URL = require('url');
const { SourceMapConsumer } = require('source-map');

module.exports = function (env, params) {
	params = params || {};

	let entry = resolve(env.dest, './ssr-build/ssr-bundle.js');
	let url = params.url || '/';

	global.history = {};
	global.location = { ...URL.parse(url) };

	try {
		let m = require(entry),
			app = (m && m.default) || m;

		if (typeof app !== 'function') {
			// eslint-disable-next-line no-console
			console.warn(
				'Entry does not export a Component function/class, aborting prerendering.'
			);
			return '';
		}
		const { cwd } = env;

		const preact = require(require.resolve(`${cwd}/node_modules/preact`));
		const renderToString = require(require.resolve(
			`${cwd}/node_modules/preact-render-to-string`
		));
		return renderToString(preact.h(app, { ...params, url }));
	} catch (err) {
		let stack = stackTrace
			.parse(err)
			.filter((s) => s.getFileName() === entry)[0];
		if (!stack) {
			throw err;
		}

		handlePrerenderError(err, env, stack, entry);
	}
};

async function handlePrerenderError(err, env, stack, entry) {
	let errorMessage = err.toString();
	let isReferenceError = errorMessage.startsWith('ReferenceError');
	let methodName = stack.getMethodName();
	let sourceMapContent, position, sourcePath, sourceLines, sourceCodeHighlight;

	try {
		sourceMapContent = JSON.parse(readFileSync(`${entry}.map`));
	} catch (err) {
		process.stderr.write(red(`Unable to read sourcemap: ${entry}.map\n`));
	}

	if (sourceMapContent) {
		await SourceMapConsumer.with(sourceMapContent, null, (consumer) => {
			position = consumer.originalPositionFor({
				line: stack.getLineNumber(),
				column: stack.getColumnNumber(),
			});
		});

		if (position.source) {
			position.source = position.source
				.replace('webpack://', '.')
				.replace(/^.*~\/((?:@[^/]+\/)?[^/]+)/, (s, name) =>
					require
						.resolve(name)
						.replace(/^(.*?\/node_modules\/(@[^/]+\/)?[^/]+)(\/.*)$/, '$1')
				);

			sourcePath = resolve(env.src, position.source);
			sourceLines;
			try {
				sourceLines = readFileSync(sourcePath, 'utf-8').split('\n');
			} catch (err) {
				try {
					sourceLines = readFileSync(
						require.resolve(position.source),
						'utf-8'
					).split('\n');
				} catch (err) {
					process.stderr.write(red(`Unable to read file: ${sourcePath}\n`));
				}
				// process.stderr.write(red(`Unable to read file: ${sourcePath}\n`));
			}
			sourceCodeHighlight = '';
		}

		if (sourceLines) {
			for (var i = -4; i <= 4; i++) {
				let color = i === 0 ? red : yellow;
				let line = position.line + i;
				let sourceLine = sourceLines[line - 1];
				sourceCodeHighlight += sourceLine ? `${color(sourceLine)}\n` : '';
			}
		}
	}

	process.stderr.write('\n');
	process.stderr.write(red(`${errorMessage}\n`));
	// check if we have methodName (ie, the error originated in user code)
	if (methodName) {
		process.stderr.write(`method: ${methodName}\n`);
		if (sourceMapContent & sourceCodeHighlight) {
			process.stderr.write(
				`at: ${sourcePath}:${position.line}:${position.column}\n`
			);
			process.stderr.write('\n');
			process.stderr.write('Source code:\n\n');
			process.stderr.write(sourceCodeHighlight);
			process.stderr.write('\n');
		} else {
			process.stderr.write('\n');
			process.stderr.write('Stack:\n\n');
			process.stderr.write(JSON.stringify(stack, null, 4) + '\n');
		}
	} else {
		process.stderr.write(
			yellow(
				'Cannot determine error position. This most likely means it originated in node_modules.'
			)
		);
		process.stderr.write('\n\n');
	}
	process.stderr.write(
		`This ${
			isReferenceError ? 'is most likely' : 'could be'
		} caused by using DOM or Web APIs.\n`
	);
	process.stderr.write(
		`Pre-render runs in node and has no access to globals available in browsers.\n\n`
	);
	process.stderr.write(
		`Consider wrapping code producing error in: 'if (typeof window !== "undefined") { ... }'\n`
	);

	if (methodName === 'componentWillMount') {
		process.stderr.write(`or place logic in 'componentDidMount' method.\n`);
	}
	process.stderr.write('\n');
	process.stderr.write(
		`Alternatively use 'preact build --no-prerender' to disable prerendering.\n\n`
	);
	process.stderr.write(
		'See https://github.com/developit/preact-cli#pre-rendering for further information.'
	);
	process.exit(1);
}
