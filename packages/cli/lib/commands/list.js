const { bold, magenta } = require('kleur');

const { error, info } = require('../util');
const { fetchTemplates } = require('../template-listings-helper');

module.exports = async function() {
	try {
		const repos = await fetchTemplates();

		process.stdout.write('\n');
		info('Available official templates: \n');

		repos.map(repo => {
			const description = repo.description ? ` - ${repo.description}` : '';
			process.stdout.write(
				`  ⭐️  ${bold(magenta(repo.title))}${description} \n`
			);
		});

		process.stdout.write('\n');
	} catch (err) {
		error((err && err.stack) || err.message || err, 1);
	}
};
