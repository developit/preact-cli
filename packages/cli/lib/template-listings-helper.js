const os = require('os');
const { join } = require('path');
const fetch = require('isomorphic-unfetch');

const fs = require('./fs');
const { info, error } = require('./util');

const {
	TEMPLATES_REPO_URL,
	TEMPLATES_CACHE_FOLDER,
	TEMPLATES_CACHE_FILENAME,
	FALLBACK_TEMPLATE_OPTIONS,
} = require('./constants.js');

async function updateTemplatesCache() {
	const cacheFilePath = join(
		os.homedir(),
		TEMPLATES_CACHE_FOLDER,
		TEMPLATES_CACHE_FILENAME
	);

	try {
		const repos = await fetch(TEMPLATES_REPO_URL).then(r => r.json());
		await fs.writeFile(cacheFilePath, JSON.stringify(repos, null, 2), 'utf-8');
	} catch (err) {
		error(`\nFailed to update template cache\n ${err}`);
	}
}

function normalizeTemplatesResponse(repos = []) {
	return repos.map(repo => ({
		title: repo.name || '',
		value: repo.full_name || '',
		description: repo.description || '',
	}));
}

exports.fetchTemplates = async function() {
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
		if (!fs.existsSync(cacheFolder)) {
			await fs.mkdir(cacheFolder);
		}

		// If cache file doesn't exist, then hit the API and fetch the data
		if (!fs.existsSync(cacheFilePath)) {
			const repos = await fetch(TEMPLATES_REPO_URL).then(r => r.json());
			await fs.writeFile(
				cacheFilePath,
				JSON.stringify(repos, null, 2),
				'utf-8'
			);
		}

		// update the cache file without blocking the rest of the tasks.
		updateTemplatesCache();

		// fetch the API response from cache file
		const templatesFromCache = await fs.readFile(cacheFilePath, 'utf-8');
		const parsedTemplates = JSON.parse(templatesFromCache);
		const officialTemplates = normalizeTemplatesResponse(parsedTemplates || []);

		templates = officialTemplates;
	} catch (e) {
		// in case github API fails to fetch the data, fallback to the hard coded listings
		templates = FALLBACK_TEMPLATE_OPTIONS;
	}

	return templates;
};
