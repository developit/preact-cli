import crossSpawn from 'cross-spawn-promise';
import { spawn as spawnChild } from 'child_process';
import path from 'path';
import mkdirp from 'mkdirp';
import fs from 'fs.promised';
import { createWorkDir } from './output';
import { waitUntil, withLog } from './utils';
import { shouldInstallDeps } from './tests-config';

const builtPreactCliPath = path.resolve(__dirname, '../../lib/index.js');

export const create = async (appName, template) => {
	let workDir = createWorkDir();
	await withLog(() => mkdirp(workDir), 'Create work directory');
	await withLog(
		() => createApp(template, appName, workDir),
		'preact create'
	);

	let appDir = path.resolve(workDir, appName);

	if (shouldInstallDeps()) {
		await withLog(
			() => run('npm', ['i', '--save-dev', path.relative(appDir, process.cwd())], appDir),
			'Install local preact-cli'
		);
	}

	return appDir;
};

export const build = appDir => withLog(
	() => preact(['build'], appDir),
	'preact build'
);

export const serve = (appDir, port) => withLog(
	() => spawnPreact(['serve', port ? `-p=${port}` : undefined], appDir),
	'preact serve'
);

export const watch = (appDir, port) => withLog(
	() => spawnPreact(['watch', port ? `-p=${port}` : undefined], appDir),
	'preact watch'
);

const createApp = async (template, appName, workDir) => {
	let cliPath = builtPreactCliPath;
	let install = process.env.WITH_INSTALL ? '--install' : '--no-install';
	let args = [cliPath, 'create', '--no-git', install, appName, template ? `--type=${template}` : undefined];

	await exists(cliPath);
	await exists(workDir);

	await run('node', args, workDir);
};

const preact = async (args, cwd) => {
	await run('node', [cliPath(cwd), ...args], cwd);
};

const run = async (command, args, cwd) => {
	try {
		await crossSpawn(command, args.filter(Boolean), { cwd });
	} catch (err) {
		if (err.stderr) {
			console.error(err.stderr.toString()); //eslint-disable-line no-console
		}

		throw err.toString();
	}
};

const spawnPreact = (args, cwd) => new Promise((resolve, reject) => {
	let child = spawnChild('node', [cliPath(cwd), ...args.filter(Boolean)], { cwd });
	let exitCode, killed = false;
	let errListener = err => {
		reject(err);
	};

	child.on('error', errListener);
	child.on('exit', code => {
		killed = true;
		exitCode = code;
	});

	let origKill = child.kill.bind(child);
	child.kill = () => new Promise((resolve) => {
		child.stdout.unpipe(process.stdout);
		child.stderr.unpipe(process.stderr);
		if (killed) {
			resolve(exitCode);
		} else {
			child.on('exit', (code) => {
				resolve(code);
			});
		}

		origKill();
	});

	child.stdout.pipe(process.stdout);
	child.stderr.pipe(process.stderr);

	setTimeout(() => {
		child.removeListener('error', errListener);
		resolve(child);
	}, 500);
});

const cliPath = (cwd) => shouldInstallDeps()
		? path.resolve(cwd, './node_modules/.bin/preact')
		: builtPreactCliPath;

const exists = (path) => waitUntil(
	() => withLog(() => fs.exists(path), `Check path exists: ${path}`),
	`${path} doesn\'t exist`
);
