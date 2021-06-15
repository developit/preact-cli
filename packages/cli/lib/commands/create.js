const ora = require('ora');
const { promisify } = require('util');
const fetch = require('isomorphic-unfetch');
const glob = promisify(require('glob').glob);
const gittar = require('gittar');
const { existsSync, mkdirSync } = require('fs');
const { copyFile, mkdir, readFile, writeFile } = require('fs').promises;
const os = require('os');
const { green } = require('kleur');
const { resolve, join } = require('path');
const { prompt } = require('prompts');
const isValidName = require('validate-npm-package-name');
const {
	info,
	isDir,
	hasCommand,
	error,
	trim,
	warn,
	dirExists,
	normalizeTemplatesResponse,
} = require('../util');
const {
	CUSTOM_TEMPLATE,
	TEMPLATES_REPO_URL,
	TEMPLATES_CACHE_FOLDER,
	TEMPLATES_CACHE_FILENAME,
	FALLBACK_TEMPLATE_OPTIONS,
} = require('../constants');
const { addScripts, install, initGit } = require('../lib/setup');
const { validateArgs } = require('./validate-args');

const ORG = 'preactjs-templates';
const RGX = /\.(woff2?|ttf|eot|jpe?g|ico|png|gif|webp|mp4|mov|ogg|webm)(\?.*)?$/i;
const isMedia = str => RGX.test(str);
const capitalize = str => str.charAt(0).toUpperCase() + str.substring(1);

const options = [
	{
		name: '--name',
		description: 'The application name',
	},
	{
		name: '--cwd',
		description: 'A directory to use instead of $PWD',
		default: '.',
	},
	{
		name: '--force',
		description: 'Force destination output; will override!',
		default: false,
	},
	{
		name: '--install',
		description: 'Install dependencies',
		default: true,
	},
	{
		name: '--yarn',
		description: 'Use `yarn` instead of `npm`',
		default: false,
	},
	{
		name: '--git',
		description: 'Initialize git repository',
		default: false,
	},
	{
		name: '--license',
		description: 'License type',
		default: 'MIT',
	},
	{
		name: '-v, --verbose',
		description: 'Verbose output',
		default: false,
	},
];

// Formulate Questions if `create` args are missing
function requestParams(repo, dest, argv, templates) {
	const cwd = resolve(argv.cwd);

	return [
		// Required data
		{
			type: repo ? null : 'select',
			name: 'template',
			message: 'Pick a template',
			choices: templates,
			initial: 0,
		},
		{
			type: prev => (prev === 'custom' ? 'text' : null),
			name: 'template',
			message: 'Remote template to clone (user/repo#tag)',
		},
		{
			type: dest ? null : 'text',
			name: 'dest',
			message: 'Directory to create the app',
		},
		{
			type: prev => (!dirExists(cwd, prev || dest) ? null : 'confirm'),
			name: 'force',
			message: 'The destination directory exists. Overwrite?',
			initial: false,
			onState: state => {
				if (state.aborted || !state.value) {
					process.stdout.write('\n');
					warn('Aborting due to existing directory');
					process.exit();
				}
			},
		},
		// Extra data / flags
		{
			type: argv.name ? null : 'text',
			name: 'name',
			message: 'The name of your application',
		},
		{
			type: 'confirm',
			name: 'install',
			message: 'Install dependencies',
			initial: true,
		},
		{
			type: prev => (!argv.yarn && prev ? 'confirm' : null),
			name: 'yarn',
			message: 'Install with `yarn` instead of `npm`',
			initial: false,
		},
		{
			type: argv.git ? null : 'confirm',
			name: 'git',
			message: 'Initialize a `git` repository',
			initial: false,
		},
	];
}

async function updateTemplatesCache() {
	const cacheFilePath = join(
		os.homedir(),
		TEMPLATES_CACHE_FOLDER,
		TEMPLATES_CACHE_FILENAME
	);

	try {
		const repos = await fetch(TEMPLATES_REPO_URL).then(r => r.json());
		await writeFile(cacheFilePath, JSON.stringify(repos, null, 2), 'utf-8');
	} catch (err) {
		error(`\nFailed to update template cache\n ${err}`);
	}
}

async function fetchTemplates() {
	let templates = [];
	const cacheFolder = join(os.homedir(), TEMPLATES_CACHE_FOLDER);
	const cacheFilePath = join(
		os.homedir(),
		TEMPLATES_CACHE_FOLDER,
		TEMPLATES_CACHE_FILENAME
	);

	try {
		// fetch the repos list from the github API
		info('Fetching official templates:\n');

		// check if `.cache` folder exists or not, and create if does not exists
		if (!existsSync(cacheFolder)) {
			await mkdir(cacheFolder);
		}

		// If cache file doesn't exist, then hit the API and fetch the data
		if (!existsSync(cacheFilePath)) {
			const repos = await fetch(TEMPLATES_REPO_URL).then(r => r.json());
			await writeFile(
				cacheFilePath,
				JSON.stringify(repos, null, 2),
				'utf-8'
			);
		}

		// update the cache file without blocking the rest of the tasks.
		updateTemplatesCache();

		// fetch the API response from cache file
		const templatesFromCache = await readFile(cacheFilePath, 'utf-8');
		const parsedTemplates = JSON.parse(templatesFromCache);
		const officialTemplates = normalizeTemplatesResponse(parsedTemplates || []);

		templates = officialTemplates.concat(CUSTOM_TEMPLATE);
	} catch (e) {
		// in case github API fails to fetch the data, fallback to the hard coded listings
		templates = FALLBACK_TEMPLATE_OPTIONS.concat(CUSTOM_TEMPLATE);
	}

	return templates;
}

async function copyFileToDestination(srcPath, destPath, force = false) {
	if (!existsSync(destPath) || force) {
		await copyFile(srcPath, destPath);
	}
}

async function command(repo, dest, argv) {
	validateArgs(argv, options, 'create');
	// Prompt if incomplete data
	if (!repo || !dest) {
		const templates = await fetchTemplates();
		const questions = requestParams(repo, dest, argv, templates);
		const onCancel = () => {
			info('Aborting execution');
			process.exit();
		};
		const response = await prompt(questions, { onCancel });

		Object.assign(argv, response);
		repo = repo || response.template;
		dest = dest || response.dest;
	}

	if (!repo || !dest) {
		warn('Insufficient arguments!');
		info('Alternatively, run `preact create --help` for usage info.');
		return;
	}

	let cwd = resolve(argv.cwd);
	let target = resolve(cwd, dest);
	let isYarn = argv.yarn && hasCommand('yarn');
	let exists = isDir(target);

	if (exists && !argv.force) {
		return error(
			'Refusing to overwrite current directory! Please specify a different destination or use the `--force` flag',
			1
		);
	}

	if (exists && argv.force) {
		let { enableForce } = await prompt({
			type: 'confirm',
			name: 'enableForce',
			message: `You are using '--force'. Do you wish to continue?`,
			initial: false,
		});

		if (enableForce) {
			info('Initializing project in the current directory!');
		} else {
			return error('Refusing to overwrite current directory!', 1);
		}
	}

	// Use `--name` value or `dest` dir's name
	argv.name = argv.name || dest;

	let { errors } = isValidName(argv.name);
	if (errors) {
		errors.unshift(`Invalid package name: ${argv.name}`);
		return error(errors.map(capitalize).join('\n  ~ '), 1);
	}

	if (!repo.includes('/')) {
		repo = `${ORG}/${repo}`;
		info(`Assuming you meant ${repo}...`);
	}

	if (!existsSync(resolve(cwd, dest, 'src'))) {
		mkdirSync(resolve(cwd, dest, 'src'), { recursive: true });
	}

	// Attempt to fetch the `template`
	let archive = await gittar.fetch(repo).catch(err => {
		err = err || { message: 'An error occured while fetching template.' };

		return error(
			err.code === 404
				? `Could not find repository: ${repo}`
				: (argv.verbose && err.stack) || err.message,
			1
		);
	});

	let spinner = ora({
		text: 'Creating project',
		color: 'magenta',
	}).start();

	// Extract files from `archive` to `target`
	// TODO: read & respond to meta/hooks
	let keeps = [];
	await gittar.extract(archive, target, {
		strip: 2,
		filter(path, obj) {
			if (path.includes('/template/')) {
				obj.on('end', () => {
					if (obj.type === 'File' && !isMedia(obj.path)) {
						keeps.push(obj.absolute);
					}
				});
				return true;
			}
		},
	});

	if (keeps.length) {
		// eslint-disable-next-line
		const dict = new Map();
		const templateVar = str => new RegExp(`{{\\s?${str}\\s}}`, 'g');

		dict.set(templateVar('pkg-install'), isYarn ? 'yarn' : 'npm install');
		dict.set(templateVar('pkg-run'), isYarn ? 'yarn' : 'npm run');
		dict.set(templateVar('pkg-add'), isYarn ? 'yarn add' : 'npm install');
		dict.set(templateVar('now-year'), new Date().getFullYear());
		dict.set(templateVar('license'), argv.license || 'MIT');

		// TODO: concat author-driven patterns
		['name'].forEach(str => {
			// if value is defined
			if (argv[str] !== void 0) {
				dict.set(templateVar(str), argv[str]);
			}
		});
		// Update each file's contents
		let buf,
			entry,
			enc = 'utf8';
		for (entry of keeps) {
			buf = await readFile(entry, enc);
			dict.forEach((v, k) => {
				buf = buf.replace(k, v);
			});
			await writeFile(entry, buf, enc);
		}
	} else {
		return error(`No \`template\` directory found within ${repo}!`, 1);
	}

	spinner.text = 'Parsing `package.json` file';

	// Validate user's `package.json` file
	let pkgData,
		pkgFile = resolve(target, 'package.json');

	if (pkgFile) {
		pkgData = JSON.parse(await readFile(pkgFile));
		// Write default "scripts" if none found
		pkgData.scripts =
			pkgData.scripts || (await addScripts(pkgData, target, isYarn));
	} else {
		warn('Could not locate `package.json` file!');
	}

	// Update `package.json` key
	if (pkgData) {
		spinner.text = 'Updating `name` within `package.json` file';
		pkgData.name = argv.name.toLowerCase().replace(/\s+/g, '_');
	}
	// Find a `manifest.json`; use the first match, if any
	let files = await glob(target + '/**/manifest.json');
	let manifest = files[0] && JSON.parse(await readFile(files[0]));
	if (manifest) {
		spinner.text = 'Updating `name` within `manifest.json` file';
		manifest.name = manifest.short_name = argv.name;
		// Write changes to `manifest.json`
		await writeFile(files[0], JSON.stringify(manifest, null, 2));
		if (argv.name.length > 12) {
			// @see https://developer.chrome.com/extensions/manifest/name#short_name
			process.stdout.write('\n');
			warn('Your `short_name` should be fewer than 12 characters.');
		}
	}

	if (pkgData) {
		// Assume changes were made ¯\_(ツ)_/¯
		await writeFile(pkgFile, JSON.stringify(pkgData, null, 2));
	}

	const sourceDirectory = join(resolve(cwd, dest), 'src');

	if (!repo.includes('widget')) {
		// Copy over template.html
		const templateSrc = resolve(
			__dirname,
			join('..', 'resources', 'template.html')
		);
		const templateDest = join(sourceDirectory, 'template.html');
		await copyFileToDestination(templateSrc, templateDest);

		// Copy over sw.js
		const serviceWorkerSrc = resolve(
			__dirname,
			join('..', '..', 'sw', 'sw.js')
		);
		const serviceWorkerDest = join(sourceDirectory, 'sw.js');
		await copyFileToDestination(serviceWorkerSrc, serviceWorkerDest);
	}

	if (argv.install) {
		spinner.text = 'Installing dependencies:\n';
		spinner.stopAndPersist();
		await install(target, isYarn);
	}

	spinner.succeed('Done!\n');

	if (argv.git) {
		await initGit(target);
	}

	let pfx = isYarn ? 'yarn' : 'npm run';

	process.stdout.write(
		trim(`
		To get started, cd into the new directory:
		  ${green('cd ' + dest)}

		To start a development live-reload server:
		  ${green(pfx + ' dev')}

		To create a production build (in ./build):
		  ${green(pfx + ' build')}

		To start a production HTTP/2 server:
		  ${green(pfx + ' serve')}
	`) + '\n\n'
	);
}

module.exports = {
	command,
	options,
};
