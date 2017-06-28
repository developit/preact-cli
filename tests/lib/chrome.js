import { Launcher } from 'chrome-launcher';
import chrome from 'chrome-remote-interface';

export default async () => {
	let launcher = new Launcher({
		port: 9222,
		autoSelectChrome: true,
		additionalFlags: [
			'--window-size=1024,768',
			'--disable-gpu',
			'--headless'
		]
	});
	launcher.pollInterval = 1000;
	await launcher.launch();
	let protocol = await setup();
	return { launcher, protocol };
};

export const delay = time => new Promise(r => setTimeout(() => r(), time));

export const getElementHtml = async (Runtime, selector) => {
	let { result } = await Runtime.evaluate({ expression: `document.querySelector("${selector}").outerHTML` });
	return result.value;
};

export const waitUntil = async (Runtime, expression, retryCount = 10, retryInterval = 500) => {
	if (retryCount < 0) {
		throw new Error(`Wait until: '${expression}' timed out.`);
	}

	let { result } = await Runtime.evaluate({ expression });
	if (result && result.subtype === 'promise') {
		let message = await Runtime.awaitPromise({
			promiseObjectId: result.objectId,
			returnByValue: true
		});
		result = message.result;
	}

	if (!result || !result.value) {
		await delay(retryInterval);
		await waitUntil(Runtime, expression, retryCount - 1, retryInterval);
	}
};

export const loadPage = async (chrome, url, retryCount = 10, retryInterval = 5000) => {
	let result = await openPage(chrome, url, retryCount, retryInterval);
	await chrome.Page.loadEventFired();
	return result;
};

const openPage = async (chrome, url, retryCount, retryInterval) => {
	if (retryCount < 0) {
		throw new Error('Page could not be loaded!');
	}

	let result;
	try {
		result = await navigateToPage(chrome, url, retryInterval);
	} catch (e) {
		result = await openPage(chrome, url, retryCount - 1, retryInterval);
	}

	return result;
};

const setup = () => new Promise((resolve, reject) => {
	chrome(protocol => {
		const { Page, Runtime, Network, DOM, ServiceWorker } = protocol;

		Promise.all([
			Page.enable(),
			Runtime.enable(),
			Network.enable(),
			DOM.enable(),
			ServiceWorker.enable()
		]).then(() => {
			resolve(protocol);
		})
		.catch(reject);
		}).on('error', err =>  reject(new Error('Cannot connect to Chrome:' + err)));
});

const navigateToPage = (chrome, url, timeout) => new Promise(async (resolve, reject) => {
	let timer;

	let listener = (result) => {
		let { status, url: responseUrl } = result.response;
		if (responseUrl === url) {
			chrome.removeListener('Network.responseReceived', listener);
			clearTimeout(timer);
			return status < 400 ? resolve(result) : reject(status);
		}
	};

	timer = setTimeout(() => {
		chrome.removeListener('Network.responseReceived', listener);
		reject();
	}, timeout);

	chrome.on('Network.responseReceived', listener);
	await chrome.Page.navigate({ url });
});
