/* eslint-disable no-console */
const { relative, resolve } = require('path');
const { stat } = require('fs').promises;
const minimatch = require('minimatch');
const pRetry = require('p-retry');
const { promisify } = require('util');
const glob = promisify(require('glob').glob);
const hooks = require('../../lib/lib/webpack/hooks');

const PER = 0.05; // % diff
const LOG = !!process.env.WITH_LOG;
const logger = (lvl, msg) => (lvl === 'error' || LOG) && console[lvl](msg);

// `node-glob` ignore pattern buggy?
const ignores = x => !/node_modules|package-lock|yarn.lock/i.test(x);

function expand(dir, opts) {
	dir = resolve(dir);
	opts = Object.assign({ dot: true, nodir: true }, opts);
	return glob(`${dir}/**/*.*`, opts).then(arr => arr.filter(ignores));
}

async function bytes(str) {
	return (await stat(str)).size;
}

async function snapshot(dir) {
	let str,
		tmp,
		out = {};
	for (str of await expand(dir)) {
		tmp = relative(dir, str);
		out[tmp] = await bytes(str);
	}
	return out;
}

const hasKey = (key, arr) => arr.find(k => minimatch(key, k)) || false;
const isWithin = (val, tar) =>
	val == tar || (val > (1 - PER) * tar && val < (1 + PER) * tar);

async function log(fn, msg) {
	logger('info', `${msg} - started...`);
	try {
		let result = await fn();
		logger('info', `${msg} - done.`);
		return result;
	} catch (err) {
		logger('error', `${msg} - failed!`);
		throw err;
	}
}

function waitUntil(action, errorMessage) {
	return pRetry(action, { retries: 10, minTimeout: 250 }).catch(err => {
		console.log('> waitUntil error', err);
		throw new Error(errorMessage);
	});
}

const sleep = promisify(setTimeout);

module.exports = {
	expand,
	bytes,
	snapshot,
	log,
	waitUntil,
	sleep,
	hasKey,
	isWithin,
	hooks,
};
