/* global __webpack_public_path__ */

import * as Preact from 'preact';
const { h, render, hydrate } = Preact;

const interopDefault = m => (m && m.default ? m.default : m);

const normalizeURL = url => (url[url.length - 1] === '/' ? url : url + '/');

if (process.env.NODE_ENV === 'development') {
	// enable preact devtools
	require('preact/debug');

	// only add a debug sw if webpack service worker is not requested.
	if (process.env.ADD_SW === undefined && 'serviceWorker' in navigator) {
		// eslint-disable-next-line no-undef
		navigator.serviceWorker.register(
			normalizeURL(__webpack_public_path__) + 'sw-debug.js'
		);
	} else if (process.env.ADD_SW && 'serviceWorker' in navigator) {
		// eslint-disable-next-line no-undef
		navigator.serviceWorker.register(
			normalizeURL(__webpack_public_path__) +
				(process.env.ES_BUILD ? 'sw-esm.js' : 'sw.js')
		);
	}
} else if (process.env.ADD_SW && 'serviceWorker' in navigator) {
	// eslint-disable-next-line no-undef
	navigator.serviceWorker.register(
		normalizeURL(__webpack_public_path__) +
			(process.env.ES_BUILD ? 'sw-esm.js' : 'sw.js')
	);
}

let app = interopDefault(require('preact-cli-entrypoint'));

if (typeof app === 'function') {
	let root =
		document.getElementById('preact_root') || document.body.firstElementChild;

	let init = () => {
		let app = interopDefault(require('preact-cli-entrypoint'));
		let preRenderData = {};
		const inlineDataElement = document.querySelector(
			'[type="__PREACT_CLI_DATA__"]'
		);
		if (inlineDataElement) {
			preRenderData =
				JSON.parse(decodeURI(inlineDataElement.innerHTML)).preRenderData ||
				preRenderData;
		}
		/* An object named CLI_DATA is passed as a prop,
		 * this keeps us future proof if in case we decide,
		 * to send other data like at some point in time.
		 */
		const CLI_DATA = { preRenderData };
		const currentURL = preRenderData.url ? normalizeURL(preRenderData.url) : '';
		const canHydrate =
			process.env.PRERENDER &&
			process.env.NODE_ENV === 'production' &&
			hydrate &&
			currentURL === normalizeURL(location.pathname);
		const doRender = canHydrate ? hydrate : render;
		root = doRender(h(app, { CLI_DATA }), document.body, root);
	};

	if (module.hot) module.hot.accept('preact-cli-entrypoint', init);

	init();
}
