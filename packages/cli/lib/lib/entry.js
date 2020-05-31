/* global __webpack_public_path__, IS_PREACT_X */

import * as Preact from 'preact';
const { h, render, hydrate } = Preact;

const interopDefault = (m) => (m && m.default ? m.default : m);

const normalizeURL = (url) => (url[url.length - 1] === '/' ? url : url + '/');

if (process.env.NODE_ENV === 'development') {
	// enable preact devtools
	require('preact/debug');
	if (process.env.RHL) {
		// enable hot loader
		const hotLoader = interopDefault(require('react-hot-loader'));
		hotLoader.preact(interopDefault(require('preact')));
	}
	// only add a debug sw if webpack service worker is not requested.
	if (process.env.ADD_SW === undefined && 'serviceWorker' in navigator) {
		// eslint-disable-next-line no-undef
		navigator.serviceWorker.register(__webpack_public_path__ + 'sw-debug.js');
	} else if (process.env.ADD_SW && 'serviceWorker' in navigator) {
		// eslint-disable-next-line no-undef
		navigator.serviceWorker.register(
			__webpack_public_path__ + (process.env.ES_BUILD ? 'sw-esm.js' : 'sw.js')
		);
	}
} else if (process.env.ADD_SW && 'serviceWorker' in navigator) {
	// eslint-disable-next-line no-undef
	navigator.serviceWorker.register(
		__webpack_public_path__ + (process.env.ES_BUILD ? 'sw-esm.js' : 'sw.js')
	);
}

let app = interopDefault(require('preact-cli-entrypoint'));

if (typeof app === 'function') {
	let root;

	let init = () => {
		let app = interopDefault(require('preact-cli-entrypoint'));
		let preRenderData = {};
		const inlineDataElement = document.querySelector(
			'[type="__PREACT_CLI_DATA__"]'
		);
		if (inlineDataElement) {
			preRenderData =
				JSON.parse(inlineDataElement.innerHTML).preRenderData || preRenderData;
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
			currentURL === location.pathname;
		let doRender = canHydrate ? hydrate : render;
		if (IS_PREACT_X) {
			doRender(h(app, { CLI_DATA }), document.body);
			doRender = render;
		} else {
			root = doRender(
				h(app, { CLI_DATA }),
				document.body,
				root || document.body.firstElementChild
			);
		}
	};

	if (module.hot) module.hot.accept('preact-cli-entrypoint', init);

	init();
}
